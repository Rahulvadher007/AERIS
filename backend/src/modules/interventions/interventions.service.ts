import { Injectable } from '@nestjs/common';
import { InterventionsRepository } from './interventions.repository';
import { InterventionRulesEngine } from './intervention-rules.engine';
import { InterventionScoringEngine } from './intervention-scoring.engine';
import { InterventionSimulationEngine } from './intervention-simulation.engine';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class InterventionsService {
  constructor(
    private readonly repository: InterventionsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async generateInterventions() {
    // 1. Fetch Zones
    const zones = await this.prisma.zone.findMany({
      include: {
        hotspots: { take: 5, orderBy: { detectedAt: 'desc' } },
        roads: true,
      },
    });

    const latestTraffic = await this.prisma.$queryRaw<
      Array<{ roadId: string; congestionScore: number }>
    >`
      SELECT DISTINCT ON ("roadId") "roadId", "congestionScore"
      FROM "traffic_data"
      ORDER BY "roadId", "timestamp" DESC
    `;

    const trafficMap: Record<string, number> = {};
    for (const t of latestTraffic) {
      trafficMap[t.roadId] = t.congestionScore;
    }

    // Query latest AQI readings to get actual PM10, NO2, and AQI values per station
    const stations = await this.prisma.station.findMany();
    const latestAqiReadings = await this.prisma.$queryRaw<
      Array<{
        stationId: string;
        aqi: number;
        pm10: number | null;
        no2: number | null;
      }>
    >`
      SELECT DISTINCT ON ("stationId") "stationId", "aqi", "pm10", "no2"
      FROM "aqi_readings"
      ORDER BY "stationId", "timestamp" DESC
    `;

    const latestAqiMap: Record<
      string,
      { aqi: number; pm10: number | null; no2: number | null }
    > = {};
    for (const r of latestAqiReadings) {
      latestAqiMap[r.stationId] = { aqi: r.aqi, pm10: r.pm10, no2: r.no2 };
    }

    // Query latest weather readings
    const latestWeather = await this.prisma.$queryRaw<
      Array<{
        stationId: string;
        temperature: number;
        humidity: number;
        windSpeed: number;
      }>
    >`
      SELECT DISTINCT ON ("stationId") "stationId", "temperature", "humidity", "windSpeed"
      FROM "weather_data"
      ORDER BY "stationId", "timestamp" DESC
    `;

    const weatherMap: Record<
      string,
      { temperature: number; humidity: number; windSpeed: number }
    > = {};
    for (const w of latestWeather) {
      weatherMap[w.stationId] = {
        temperature: w.temperature,
        humidity: w.humidity,
        windSpeed: w.windSpeed,
      };
    }

    // Query latest forecasts
    const latestForecasts = await this.prisma.$queryRaw<
      Array<{ stationId: string; forecastAQI: number; id: string }>
    >`
      SELECT DISTINCT ON ("stationId") "stationId", "forecastAQI", "id"
      FROM "forecast_results"
      ORDER BY "stationId", "forecastDate" DESC
    `;

    const forecastMap: Record<string, { forecastAQI: number; id: string }> = {};
    for (const f of latestForecasts) {
      forecastMap[f.stationId] = { forecastAQI: f.forecastAQI, id: f.id };
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
        if (reading.pm10 !== null && reading.pm10 !== undefined)
          cityPm10List[station.city].push(reading.pm10);
        if (reading.no2 !== null && reading.no2 !== undefined)
          cityNo2List[station.city].push(reading.no2);
      }

      const f = forecastMap[station.id];
      if (f) {
        if (!cityForecastList[station.city])
          cityForecastList[station.city] = [];
        cityForecastList[station.city].push(f.forecastAQI);
      }

      const w = weatherMap[station.id];
      if (w) {
        if (!cityTempList[station.city]) cityTempList[station.city] = [];
        if (!cityHumidList[station.city]) cityHumidList[station.city] = [];
        if (!cityWindList[station.city]) cityWindList[station.city] = [];
        if (w.temperature !== null && w.temperature !== undefined)
          cityTempList[station.city].push(w.temperature);
        if (w.humidity !== null && w.humidity !== undefined)
          cityHumidList[station.city].push(w.humidity);
        if (w.windSpeed !== null && w.windSpeed !== undefined)
          cityWindList[station.city].push(w.windSpeed);
      }
    }

    const avgCityAqi: Record<string, number> = {};
    const avgCityPm10: Record<string, number> = {};
    const avgCityNo2: Record<string, number> = {};
    const avgCityForecast: Record<string, number> = {};
    const avgCityTemp: Record<string, number> = {};
    const avgCityHumid: Record<string, number> = {};
    const avgCityWind: Record<string, number> = {};

    for (const city of Array.from(new Set(stations.map((s) => s.city)))) {
      const aqis = cityAqiList[city] || [];
      avgCityAqi[city] =
        aqis.length > 0
          ? Math.round(aqis.reduce((a, b) => a + b, 0) / aqis.length)
          : 0;

      const pm10s = cityPm10List[city] || [];
      avgCityPm10[city] =
        pm10s.length > 0 ? pm10s.reduce((a, b) => a + b, 0) / pm10s.length : 0;

      const no2s = cityNo2List[city] || [];
      avgCityNo2[city] =
        no2s.length > 0 ? no2s.reduce((a, b) => a + b, 0) / no2s.length : 0;

      const forecasts = cityForecastList[city] || [];
      avgCityForecast[city] =
        forecasts.length > 0
          ? forecasts.reduce((a, b) => a + b, 0) / forecasts.length
          : 0;

      const temps = cityTempList[city] || [];
      avgCityTemp[city] =
        temps.length > 0
          ? temps.reduce((sum, item) => sum + item, 0) / temps.length
          : 0;

      const humids = cityHumidList[city] || [];
      avgCityHumid[city] =
        humids.length > 0
          ? humids.reduce((sum, item) => sum + item, 0) / humids.length
          : 0;

      const winds = cityWindList[city] || [];
      avgCityWind[city] =
        winds.length > 0
          ? winds.reduce((sum, item) => sum + item, 0) / winds.length
          : 0;
    }

    const generated = [];

    for (const zone of zones) {
      // Fetch latest Forecast ID for the city
      const cityStations = stations.filter((s) => s.city === zone.city);
      let forecastId: string | undefined = undefined;
      for (const cs of cityStations) {
        if (forecastMap[cs.id]) {
          forecastId = forecastMap[cs.id].id;
          break;
        }
      }

      // Compute Traffic Congestion
      let avgTraffic = 0;
      let validRoads = 0;
      zone.roads.forEach((r) => {
        const score = trafficMap[r.id];
        if (score !== undefined) {
          avgTraffic += score;
          validRoads++;
        }
      });
      const trafficCongestion = validRoads > 0 ? avgTraffic / validRoads : 0; // default if no roads
      const hotspotCount = zone.hotspots.length;

      // Extract meteorological and pollutant factors
      const currentAQI =
        hotspotCount > 0
          ? Math.round(
              zone.hotspots.reduce((sum: number, h: any) => sum + h.aqi, 0) /
                hotspotCount,
            )
          : avgCityAqi[zone.city] || 0;

      let pm10 = avgCityPm10[zone.city] || 0;
      if (hotspotCount > 0) {
        const hotspotPm10s = zone.hotspots
          .map((h) => h.pm10)
          .filter((v) => v !== null && v !== undefined);
        if (hotspotPm10s.length > 0) {
          pm10 = hotspotPm10s.reduce((a, b) => a + b, 0) / hotspotPm10s.length;
        }
      }

      const no2 = avgCityNo2[zone.city] || 0;
      const forecastAQI = avgCityForecast[zone.city] || 0;
      const temperature = avgCityTemp[zone.city] || 0;
      const humidity = avgCityHumid[zone.city] || 0;
      const windSpeed = avgCityWind[zone.city] || 0;

      // 2. Compute Priority & Risk
      const { score, riskLevel, priority } =
        InterventionScoringEngine.computePriorityScore(
          currentAQI,
          forecastAQI,
          trafficCongestion,
          hotspotCount,
          windSpeed,
          humidity,
          temperature,
        );

      // 3. Run Rules Engine
      const { title, description, actions } = InterventionRulesEngine.evaluate(
        currentAQI,
        forecastAQI,
        pm10,
        no2,
        trafficCongestion,
        hotspotCount,
        windSpeed,
        humidity,
        temperature,
      );

      // 4. Run Simulation Engine
      const simulation = InterventionSimulationEngine.simulateImpact(
        actions,
        currentAQI,
        windSpeed,
        humidity,
        temperature,
      );

      generated.push({
        zoneId: zone.id,
        forecastId,
        priority,
        riskLevel,
        title,
        description,
        recommendedActions: actions,
        expectedImpact: simulation.expectedImpact,
        estimatedAQIReduction: simulation.estimatedAQIReduction,
        postInterventionAQI: simulation.postInterventionAQI,
        confidenceScore: simulation.confidenceScore,
      });
    }

    await this.repository.deleteAll();
    await this.repository.createMany(generated);

    return generated;
  }

  private async enrichInterventions(interventions: any[]) {
    const unique = [];
    const seen = new Set<string>();
    for (const intervention of interventions) {
      if (intervention && !seen.has(intervention.zoneId)) {
        seen.add(intervention.zoneId);
        unique.push(intervention);
      }
    }

    const stations = await this.prisma.station.findMany();

    // Query latest AQI readings
    const latestAqiReadings = await this.prisma.$queryRaw<
      Array<{ stationId: string; aqi: number }>
    >`
      SELECT DISTINCT ON ("stationId") "stationId", "aqi"
      FROM "aqi_readings"
      ORDER BY "stationId", "timestamp" DESC
    `;

    const latestAqiMap: Record<string, number> = {};
    for (const r of latestAqiReadings) {
      latestAqiMap[r.stationId] = r.aqi;
    }

    // Query latest weather readings for windSpeed
    const latestWeather = await this.prisma.$queryRaw<
      Array<{ stationId: string; windSpeed: number }>
    >`
      SELECT DISTINCT ON ("stationId") "stationId", "windSpeed"
      FROM "weather_data"
      ORDER BY "stationId", "timestamp" DESC
    `;

    const windMap: Record<string, number> = {};
    for (const w of latestWeather) {
      windMap[w.stationId] = w.windSpeed;
    }

    // Map city to average AQI and Wind Speed
    const cityAqiMap: Record<string, number> = {};
    const cityWindMap: Record<string, number> = {};
    const cityStationsList: Record<string, number[]> = {};
    const cityWindList: Record<string, number[]> = {};

    for (const station of stations) {
      const aqi = latestAqiMap[station.id];
      if (aqi !== undefined) {
        if (!cityStationsList[station.city])
          cityStationsList[station.city] = [];
        cityStationsList[station.city].push(aqi);
      }
      const wind = windMap[station.id];
      if (wind !== undefined) {
        if (!cityWindList[station.city]) cityWindList[station.city] = [];
        cityWindList[station.city].push(wind);
      }
    }

    for (const [city, aqis] of Object.entries(cityStationsList)) {
      cityAqiMap[city] = Math.round(
        aqis.reduce((a, b) => a + b, 0) / aqis.length,
      );
    }
    for (const [city, winds] of Object.entries(cityWindList)) {
      cityWindMap[city] = winds.reduce((a, b) => a + b, 0) / winds.length;
    }

    // Fetch latest forecasts
    const latestForecasts = await this.prisma.$queryRaw<
      Array<{ stationId: string; forecastAQI: number }>
    >`
      SELECT DISTINCT ON ("stationId") "stationId", "forecastAQI"
      FROM "forecast_results"
      ORDER BY "stationId", "forecastDate" DESC
    `;

    const latestForecastsMap: Record<string, number> = {};
    for (const f of latestForecasts) {
      latestForecastsMap[f.stationId] = f.forecastAQI;
    }

    const cityForecastMap: Record<string, number> = {};
    const cityForecastsList: Record<string, number[]> = {};
    for (const station of stations) {
      const fAqi = latestForecastsMap[station.id];
      if (fAqi !== undefined) {
        if (!cityForecastsList[station.city])
          cityForecastsList[station.city] = [];
        cityForecastsList[station.city].push(fAqi);
      }
    }
    for (const [city, aqis] of Object.entries(cityForecastsList)) {
      cityForecastMap[city] = Math.round(
        aqis.reduce((a, b) => a + b, 0) / aqis.length,
      );
    }

    // Query latest traffic readings
    const latestTraffic = await this.prisma.$queryRaw<
      Array<{ roadId: string; congestionScore: number }>
    >`
      SELECT DISTINCT ON ("roadId") "roadId", "congestionScore"
      FROM "traffic_data"
      ORDER BY "roadId", "timestamp" DESC
    `;

    const trafficMap: Record<string, number> = {};
    for (const t of latestTraffic) {
      trafficMap[t.roadId] = t.congestionScore;
    }

    return unique.map((intervention) => {
      const zone = intervention.zone;
      if (!zone) return intervention;

      // Calculate current AQI
      let currentAQI = 0;
      if (zone.hotspots && zone.hotspots.length > 0) {
        currentAQI = Math.round(
          zone.hotspots.reduce((sum: number, h: any) => sum + h.aqi, 0) /
            zone.hotspots.length,
        );
      } else {
        currentAQI = cityAqiMap[zone.city] || 120;
      }

      // Calculate forecast AQI
      const forecastAQI =
        cityForecastMap[zone.city] || Math.round(currentAQI * 1.15);

      // Compute contributing factors dynamically (Source Attribution)
      const contributingFactors: string[] = [];

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
      const windSpeed = cityWindMap[zone.city] || 3.0;

      if (trafficCongestion > 65) {
        contributingFactors.push('Heavy Vehicle Congestion');
      }
      if (zone.hotspots.length >= 3) {
        contributingFactors.push('Fugitive Particulate Hotspots');
      }
      if (windSpeed < 2.2) {
        contributingFactors.push('Atmospheric Stagnation');
      }
      if (currentAQI > 250) {
        contributingFactors.push('High Ambient Background');
      }

      if (contributingFactors.length === 0) {
        contributingFactors.push('Mixed Urban Emissions');
      }

      return {
        ...intervention,
        currentAQI,
        forecastAQI,
        contributingFactors,
      };
    });
  }

  async findAll(city?: string) {
    const raw = await this.repository.findAll(city);
    return this.enrichInterventions(raw);
  }

  async findById(id: string) {
    const raw = await this.repository.findById(id);
    if (!raw) return null;
    const enriched = await this.enrichInterventions([raw]);
    return enriched[0];
  }

  async findByZone(zoneId: string) {
    const raw = await this.repository.findByZone(zoneId);
    return this.enrichInterventions(raw);
  }

  async getDashboard(city?: string) {
    return this.repository.getDashboardMetrics(city);
  }
}
