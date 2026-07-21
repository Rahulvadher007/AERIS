import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { AQIAgent } from './aqi.agent';
import { WeatherAgent } from './weather.agent';
import { TrafficAgent } from './traffic.agent';
import { ForecastAgent } from './forecast.agent';
import { HotspotAgent } from './hotspot.agent';
import { SourceAttributionAgent } from './source-attribution.agent';
import { InterventionAgent } from './intervention.agent';
import { CitizenAdvisoryAgent } from './citizen-advisory.agent';

@Injectable()
export class CoordinatorAgent {
  private readonly logger = new Logger(CoordinatorAgent.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aqiAgent: AQIAgent,
    private readonly weatherAgent: WeatherAgent,
    private readonly trafficAgent: TrafficAgent,
    private readonly forecastAgent: ForecastAgent,
    private readonly hotspotAgent: HotspotAgent,
    private readonly sourceAttributionAgent: SourceAttributionAgent,
    private readonly interventionAgent: InterventionAgent,
    private readonly citizenAdvisoryAgent: CitizenAdvisoryAgent
  ) {}

  /**
   * Local scheduler: Runs the full multi-agent orchestration sweep every hour.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleScheduledSweep() {
    this.logger.log('Coordinator Agent [Schedule]: Triggering scheduled multi-agent orchestration sweep...');
    await this.coordinateSweep();
    this.logger.log('Coordinator Agent [Schedule]: Scheduled multi-agent sweep completed.');
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Group timed out after ${ms}ms`)), ms)
    );
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return Promise.race([
      promise,
      this.timeout(ms)
    ]).catch((err) => {
      this.logger.warn(`Coordinator Agent: ${label} failed/timed out: ${err.message}`);
      throw err;
    }) as Promise<T>;
  }

  async coordinateSweep() {
    this.logger.log('Coordinator Agent: Starting orchestration sweep across all 9 agents...');

    try {
      const rawAqiReadings = await this.prisma.aqiReading.findMany({ take: 50, orderBy: { timestamp: 'desc' } });
      const rawWeatherReadings = await this.prisma.weatherData.findMany({ take: 50, orderBy: { timestamp: 'desc' } });
      const rawTrafficReadings = await this.prisma.trafficData.findMany({ take: 50, orderBy: { timestamp: 'desc' } });

      // Group 1: Parallel — AQI | Weather | Traffic
      const startG1 = Date.now();
      const [validatedAqi, validatedWeather, validatedTraffic] = await this.withTimeout(
        Promise.all([
          this.aqiAgent.processReadings(rawAqiReadings),
          this.weatherAgent.processWeather(rawWeatherReadings),
          this.trafficAgent.processTraffic(rawTrafficReadings),
        ]),
        30000,
        'Group 1 (AQI, Weather, Traffic)'
      );
      this.logger.log(`Coordinator Agent: Group 1 completed in ${Date.now() - startG1}ms`);

      // Group 2: Depends on G1 — Forecast | Hotspot
      const startG2 = Date.now();
      const [forecastResults, hotspots] = await this.withTimeout(
        Promise.all([
          this.forecastAgent.executeForecasts(),
          this.hotspotAgent.detectHotspots(),
        ]),
        30000,
        'Group 2 (Forecast, Hotspot)'
      );
      this.logger.log(`Coordinator Agent: Group 2 completed in ${Date.now() - startG2}ms`);

      // Prepare data for Group 3
      const zones = await this.prisma.zone.findMany({
        include: {
          hotspots: { take: 5, orderBy: { detectedAt: 'desc' } },
          roads: true
        }
      });

      const trafficMap: Record<string, number> = {};
      rawTrafficReadings.forEach(t => { trafficMap[t.roadId] = t.congestionScore; });

      const stations = await this.prisma.station.findMany();
      const windSpeedMap: Record<string, number> = {};
      const cityWindSpeeds: Record<string, number[]> = {};
      const avgCityAqi: Record<string, number> = {};
      const avgCityForecast: Record<string, number> = {};

      validatedWeather.forEach(w => {
        const station = stations.find(s => s.id === w.stationId);
        if (station) {
          if (!cityWindSpeeds[station.city]) cityWindSpeeds[station.city] = [];
          cityWindSpeeds[station.city].push(w.windSpeed);
        }
      });
      for (const [city, speeds] of Object.entries(cityWindSpeeds)) {
        windSpeedMap[city] = speeds.reduce((a, b) => a + b, 0) / speeds.length;
      }

      // Group 3: Depends on G1 + G2 — Source Attribution | Intervention | Citizen Advisory
      const startG3 = Date.now();
      const [attributions, interventions, advisories] = await this.withTimeout(
        Promise.all([
          this.sourceAttributionAgent.attributeSources(zones, trafficMap, windSpeedMap),
          this.interventionAgent.planInterventions(),
          (async () => {
            const cityStationsList: Record<string, number[]> = {};
            const cityForecastsList: Record<string, number[]> = {};

            validatedAqi.forEach(a => {
              const station = stations.find(s => s.id === a.stationId);
              if (station) {
                if (!cityStationsList[station.city]) cityStationsList[station.city] = [];
                cityStationsList[station.city].push(a.aqi);
              }
            });
            for (const [city, aqis] of Object.entries(cityStationsList)) {
              avgCityAqi[city] = Math.round(aqis.reduce((a, b) => a + b, 0) / aqis.length);
            }

            forecastResults.forEach(fr => {
              const station = stations.find(s => s.stationCode === fr.stationCode);
              if (station && fr.forecasts['24h']) {
                if (!cityForecastsList[station.city]) cityForecastsList[station.city] = [];
                cityForecastsList[station.city].push(fr.forecasts['24h'].forecastAQI);
              }
            });
            for (const [city, forecasts] of Object.entries(cityForecastsList)) {
              avgCityForecast[city] = Math.round(forecasts.reduce((a, b) => a + b, 0) / forecasts.length);
            }

            return this.citizenAdvisoryAgent.generateAdvisories(zones, avgCityAqi, avgCityForecast);
          })()
        ]),
        60000,
        'Group 3 (Source Attribution, Intervention, Advisory)'
      );
      this.logger.log(`Coordinator Agent: Group 3 completed in ${Date.now() - startG3}ms`);

      const totalDuration = Date.now() - startG1;
      this.logger.log(`Coordinator Agent: Multi-agent orchestration sweep completed in ${totalDuration}ms.`);

      return {
        success: true,
        attributions,
        citizenAdvisories: advisories,
        summary: {
          validatedAqiCount: validatedAqi.length,
          validatedWeatherCount: validatedWeather.length,
          validatedTrafficCount: validatedTraffic.length,
          forecastStationsCount: forecastResults.length,
          hotspotsDetected: hotspots.length,
          attributionsComputed: attributions.length,
          interventionsPlanned: interventions.length,
          advisoriesGenerated: advisories.length,
        }
      };
    } catch (err: any) {
      this.logger.error(`Coordinator Agent: Orchestration sweep failed: ${err.message}`);
      throw err;
    }
  }
}
