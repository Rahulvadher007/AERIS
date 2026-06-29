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

  /**
   * Sequentially orchestrates all agents to process and analyze smart city data.
   */
  async coordinateSweep() {
    this.logger.log('Coordinator Agent: Starting orchestration sweep across all 9 agents...');

    try {
      // 1. Fetch latest raw readings from DB
      const rawAqiReadings = await this.prisma.aqiReading.findMany({ take: 50, orderBy: { timestamp: 'desc' } });
      const rawWeatherReadings = await this.prisma.weatherData.findMany({ take: 50, orderBy: { timestamp: 'desc' } });
      const rawTrafficReadings = await this.prisma.trafficData.findMany({ take: 50, orderBy: { timestamp: 'desc' } });

      // 2. Ingestion & Validation Phase (AQI, Weather, Traffic Agents)
      const validatedAqi = await this.aqiAgent.processReadings(rawAqiReadings);
      const validatedWeather = await this.weatherAgent.processWeather(rawWeatherReadings);
      const validatedTraffic = await this.trafficAgent.processTraffic(rawTrafficReadings);

      // 3. Forecasting Phase (Forecast Agent)
      const forecastResults = await this.forecastAgent.executeForecasts();

      // 4. Hotspot Detection Phase (Hotspot Agent)
      const hotspots = await this.hotspotAgent.detectHotspots();

      // 5. Source Attribution Phase (Source Attribution Agent)
      const zones = await this.prisma.zone.findMany({
        include: {
          hotspots: { take: 5, orderBy: { detectedAt: 'desc' } },
          roads: true
        }
      });

      // Prepare maps for attribution
      const trafficMap: Record<string, number> = {};
      rawTrafficReadings.forEach(t => {
        trafficMap[t.roadId] = t.congestionScore;
      });

      const windSpeedMap: Record<string, number> = {};
      const avgCityAqi: Record<string, number> = {};
      const avgCityForecast: Record<string, number> = {};

      validatedWeather.forEach(w => {
        // Map station wind speed to city
        const station = rawWeatherReadings.find(r => r.id === w.id);
        if (station) {
          windSpeedMap[w.stationId] = w.windSpeed;
        }
      });

      const attributions = await this.sourceAttributionAgent.attributeSources(zones, trafficMap, windSpeedMap);

      // 6. Intervention Planning Phase (Intervention Agent)
      const interventions = await this.interventionAgent.planInterventions();

      // 7. Citizen Advisory Phase (Citizen Advisory Agent)
      // Extract city-level AQI averages
      const cityStationsList: Record<string, number[]> = {};
      const cityForecastsList: Record<string, number[]> = {};

      const stations = await this.prisma.station.findMany();
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

      const advisories = await this.citizenAdvisoryAgent.generateAdvisories(zones, avgCityAqi, avgCityForecast);

      this.logger.log('Coordinator Agent: Multi-agent orchestration sweep completed successfully.');
      return {
        success: true,
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
