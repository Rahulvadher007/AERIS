import { Injectable } from '@nestjs/common';
import { AqiService } from '../aqi/aqi.service';
import { PrismaService } from '../../database/prisma.service';
import { InterventionScoringEngine } from '../interventions/intervention-scoring.engine';
import { InterventionRulesEngine } from '../interventions/intervention-rules.engine';
import { InterventionSimulationEngine } from '../interventions/intervention-simulation.engine';

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly aqiService: AqiService,
    private readonly prisma: PrismaService
  ) {}

  async getRecommendations(city?: string) {
    const where: any = {};
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    const zones = await this.prisma.zone.findMany({
      where,
      include: {
        hotspots: { take: 5, orderBy: { detectedAt: 'desc' } },
        roads: true
      }
    });

    // Query latest traffic readings
    const latestTraffic = await this.prisma.$queryRaw<Array<{ roadId: string; congestionScore: number }>>`
      SELECT DISTINCT ON ("roadId") "roadId", "congestionScore"
      FROM "traffic_data"
      ORDER BY "roadId", "timestamp" DESC
    `;

    const trafficMap: Record<string, number> = {};
    for (const t of latestTraffic) {
      trafficMap[t.roadId] = t.congestionScore;
    }

    const stations = await this.prisma.station.findMany();

    // Query latest AQI readings
    const latestAqiReadings = await this.prisma.$queryRaw<Array<{ stationId: string; aqi: number; pm10: number | null; no2: number | null }>>`
      SELECT DISTINCT ON ("stationId") "stationId", "aqi", "pm10", "no2"
      FROM "aqi_readings"
      ORDER BY "stationId", "timestamp" DESC
    `;

    const latestAqiMap: Record<string, { aqi: number; pm10: number | null; no2: number | null }> = {};
    for (const r of latestAqiReadings) {
      latestAqiMap[r.stationId] = { aqi: r.aqi, pm10: r.pm10, no2: r.no2 };
    }

    // Query latest weather readings
    const latestWeather = await this.prisma.$queryRaw<Array<{ stationId: string; temperature: number; humidity: number; windSpeed: number }>>`
      SELECT DISTINCT ON ("stationId") "stationId", "temperature", "humidity", "windSpeed"
      FROM "weather_data"
      ORDER BY "stationId", "timestamp" DESC
    `;

    const weatherMap: Record<string, { temperature: number; humidity: number; windSpeed: number }> = {};
    for (const w of latestWeather) {
      weatherMap[w.stationId] = { temperature: w.temperature, humidity: w.humidity, windSpeed: w.windSpeed };
    }

    // Fetch latest forecasts
    const latestForecasts = await this.prisma.$queryRaw<Array<{ stationId: string; forecastAQI: number }>>`
      SELECT DISTINCT ON ("stationId") "stationId", "forecastAQI"
      FROM "forecast_results"
      ORDER BY "stationId", "forecastDate" DESC
    `;

    const latestForecastsMap: Record<string, number> = {};
    for (const f of latestForecasts) {
      latestForecastsMap[f.stationId] = f.forecastAQI;
    }

    const cityAqiList: Record<string, number[]> = {};
    const cityPm10List: Record<string, number[]> = {};
    const cityNo2List: Record<string, number[]> = {};
    const cityForecastList: Record<string, number[]> = {};
    const cityTempList: Record<string, number[]> = {};
    const cityHumidList: Record<string, number[]> = {};
    const cityWindList: Record<string, number[]> = {};

    for (const station of stations) {
      const reading = latestAqiMap[station.id];
      if (reading) {
        if (!cityAqiList[station.city]) cityAqiList[station.city] = [];
        if (!cityPm10List[station.city]) cityPm10List[station.city] = [];
        if (!cityNo2List[station.city]) cityNo2List[station.city] = [];
        cityAqiList[station.city].push(reading.aqi);
        if (reading.pm10 !== null && reading.pm10 !== undefined) cityPm10List[station.city].push(reading.pm10);
        if (reading.no2 !== null && reading.no2 !== undefined) cityNo2List[station.city].push(reading.no2);
      }

      const fAqi = latestForecastsMap[station.id];
      if (fAqi !== undefined) {
        if (!cityForecastList[station.city]) cityForecastList[station.city] = [];
        cityForecastList[station.city].push(fAqi);
      }

      const w = weatherMap[station.id];
      if (w) {
        if (!cityTempList[station.city]) cityTempList[station.city] = [];
        if (!cityHumidList[station.city]) cityHumidList[station.city] = [];
        if (!cityWindList[station.city]) cityWindList[station.city] = [];
        if (w.temperature !== null && w.temperature !== undefined) cityTempList[station.city].push(w.temperature);
        if (w.humidity !== null && w.humidity !== undefined) cityHumidList[station.city].push(w.humidity);
        if (w.windSpeed !== null && w.windSpeed !== undefined) cityWindList[station.city].push(w.windSpeed);
      }
    }

    const avgCityAqi: Record<string, number> = {};
    const avgCityPm10: Record<string, number> = {};
    const avgCityNo2: Record<string, number> = {};
    const avgCityForecast: Record<string, number> = {};
    const avgCityTemp: Record<string, number> = {};
    const avgCityHumid: Record<string, number> = {};
    const avgCityWind: Record<string, number> = {};

    for (const city of Array.from(new Set(stations.map(s => s.city)))) {
      const aqis = cityAqiList[city] || [];
      avgCityAqi[city] = aqis.length > 0 ? Math.round(aqis.reduce((a, b) => a + b, 0) / aqis.length) : 120;

      const pm10s = cityPm10List[city] || [];
      avgCityPm10[city] = pm10s.length > 0 ? pm10s.reduce((a, b) => a + b, 0) / pm10s.length : 50;

      const no2s = cityNo2List[city] || [];
      avgCityNo2[city] = no2s.length > 0 ? no2s.reduce((a, b) => a + b, 0) / no2s.length : 20;

      const forecasts = cityForecastList[city] || [];
      avgCityForecast[city] = forecasts.length > 0 ? forecasts.reduce((a, b) => a + b, 0) / forecasts.length : 150;

      const temps = cityTempList[city] || [];
      avgCityTemp[city] = temps.length > 0 ? temps.reduce((sum, item) => sum + item, 0) / temps.length : 25;

      const humids = cityHumidList[city] || [];
      avgCityHumid[city] = humids.length > 0 ? humids.reduce((sum, item) => sum + item, 0) / humids.length : 60;

      const winds = cityWindList[city] || [];
      avgCityWind[city] = winds.length > 0 ? winds.reduce((sum, item) => sum + item, 0) / winds.length : 3.0;
    }

    return zones.map(zone => {
      // Calculate current AQI
      let currentAQI = 0;
      const hotspotCount = zone.hotspots.length;
      if (hotspotCount > 0) {
        currentAQI = Math.round(zone.hotspots.reduce((sum: number, h: any) => sum + h.aqi, 0) / hotspotCount);
      } else {
        currentAQI = avgCityAqi[zone.city] || 120;
      }

      // Fetch actual PM10, NO2, weather, and forecast
      let pm10 = avgCityPm10[zone.city] || 50;
      if (hotspotCount > 0) {
        const hotspotPm10s = zone.hotspots.map(h => h.pm10).filter(v => v !== null && v !== undefined) as number[];
        if (hotspotPm10s.length > 0) {
          pm10 = hotspotPm10s.reduce((a, b) => a + b, 0) / hotspotPm10s.length;
        }
      }
      const no2 = avgCityNo2[zone.city] || 20;
      const forecastAQI = avgCityForecast[zone.city] || 150;
      const temperature = avgCityTemp[zone.city] || 25;
      const humidity = avgCityHumid[zone.city] || 60;
      const windSpeed = avgCityWind[zone.city] || 3.0;

      // Compute traffic congestion
      let avgTraffic = 0;
      let validRoads = 0;
      zone.roads.forEach((r: any) => {
        const score = trafficMap[r.id];
        if (score !== undefined) {
          avgTraffic += score;
          validRoads++;
        }
      });
      const trafficCongestion = validRoads > 0 ? avgTraffic / validRoads : 35;

      // 1. Compute Priority & Risk
      const { score, riskLevel, priority } = InterventionScoringEngine.computePriorityScore(
        currentAQI,
        forecastAQI,
        trafficCongestion,
        hotspotCount,
        windSpeed,
        humidity,
        temperature
      );

      // 2. Run Rules Engine
      const { title, description, actions } = InterventionRulesEngine.evaluate(
        currentAQI,
        forecastAQI,
        pm10,
        no2,
        trafficCongestion,
        hotspotCount,
        windSpeed,
        humidity,
        temperature
      );

      // 3. Run Simulation Engine
      const simulation = InterventionSimulationEngine.simulateImpact(
        actions,
        currentAQI,
        windSpeed,
        humidity,
        temperature
      );

      return {
        zone: zone.zoneName,
        city: zone.city,
        priority,
        reason: `${title}: ${description}`,
        forecastAQI,
        actions: actions,
        expectedReduction: simulation.estimatedAQIReduction,
        confidence: simulation.confidenceScore
      };
    });
  }
}
