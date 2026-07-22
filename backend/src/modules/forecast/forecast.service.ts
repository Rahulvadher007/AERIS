import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ForecastRepository } from './forecast.repository';
import { StationsService } from '../stations/stations.service';
import { PrismaService } from '../../database/prisma.service';
import * as pd from 'node-pandas';

@Injectable()
export class ForecastService {
  private mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

  constructor(
    private readonly repository: ForecastRepository,
    private readonly stationsService: StationsService,
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  private async buildStationFeatures(stationCode: string): Promise<Record<string, number> | null> {
    // Fetch latest AQI readings
    const latestAqi = await this.prisma.$queryRaw<
      Array<{ timestamp: Date; aqi: number; pm25: number | null; pm10: number | null }>
    >`
      SELECT ar.timestamp, ar.aqi, ar.pm25, ar.pm10
      FROM aqi_readings ar
      JOIN stations s ON s.id = ar."stationId"
      WHERE s."stationCode" = ${stationCode}
      ORDER BY ar.timestamp DESC
      LIMIT 25
    `;

    if (!latestAqi.length || latestAqi[0].aqi === null) {
      return null;
    }

    // Fetch latest weather data
    const latestWeather = await this.prisma.$queryRaw<
      Array<{ temperature: number; humidity: number; windSpeed: number; windDirection: number; pressure: number; rainfall: number }>
    >`
      SELECT wd.temperature, wd.humidity, wd."windSpeed", wd."windDirection", wd.pressure, wd.rainfall
      FROM weather_data wd
      JOIN stations s ON s.id = wd."stationId"
      WHERE s."stationCode" = ${stationCode}
      ORDER BY wd.timestamp DESC
      LIMIT 1
    `;

    // Fetch traffic data
    const trafficData = await this.prisma.$queryRaw<
      Array<{ congestionscore: number | null; vehiclecount: number | null }>
    >`
      SELECT AVG(t."congestionScore") as congestionscore,
             SUM(t."vehicleCount") as vehiclecount
      FROM traffic_data t
      WHERE t.timestamp >= COALESCE(
        (SELECT MAX(timestamp) FROM aqi_readings ar JOIN stations s ON s.id = ar."stationId" WHERE s."stationCode" = ${stationCode}),
        NOW() - INTERVAL '1 hour'
      )
    `;

    const weather = latestWeather[0] || { temperature: 0, humidity: 0, windSpeed: 0, windDirection: 0, pressure: 0, rainfall: 0 };
    const traffic = trafficData[0] || { congestionscore: 0, vehiclecount: 0 };
    const latest = latestAqi[0];
    const aqiSeries = latestAqi.map(r => r.aqi).reverse();

    const safeGet = (arr: number[], idx: number) => arr[arr.length - idx - 1] ?? arr[0] ?? 0;

    const features: Record<string, number> = {
      hour: latest.timestamp.getHours(),
      day: latest.timestamp.getDate(),
      month: latest.timestamp.getMonth() + 1,
      dayOfWeek: latest.timestamp.getDay(),
      temperature: Number(weather.temperature) || 0,
      humidity: Number(weather.humidity) || 0,
      windSpeed: Number(weather.windSpeed) || 0,
      windDirection: Number(weather.windDirection) || 0,
      pressure: Number(weather.pressure) || 0,
      rainfall: Number(weather.rainfall) || 0,
      congestionScore: Number(traffic.congestionscore) || 0,
      vehicleCount: Number(traffic.vehiclecount) || 0,
      aqi: Number(latest.aqi) || 0,
      pm25: Number(latest.pm25) || 0,
      pm10: Number(latest.pm10) || 0,
      aqi_1h: safeGet(aqiSeries, 1),
      aqi_3h: safeGet(aqiSeries, 3),
      aqi_6h: safeGet(aqiSeries, 6),
      aqi_12h: safeGet(aqiSeries, 12),
      aqi_24h: safeGet(aqiSeries, 24),
      rollingAvg24h: aqiSeries.length >= 24
        ? aqiSeries.slice(-24).reduce((a, b) => a + b, 0) / 24
        : aqiSeries.reduce((a, b) => a + b, 0) / aqiSeries.length,
      rollingAvg72h: aqiSeries.reduce((a, b) => a + b, 0) / aqiSeries.length,
      rollingMax24h: aqiSeries.length >= 24
        ? Math.max(...aqiSeries.slice(-24))
        : Math.max(...aqiSeries),
      rollingMin24h: aqiSeries.length >= 24
        ? Math.min(...aqiSeries.slice(-24))
        : Math.min(...aqiSeries),
    };

    return features;
  }

  async generateForecast(stationCode: string, horizon: string) {
    // 1. Validate station
    const stations = await this.stationsService.findAll();
    const station = stations.data.find((s) => s.stationCode === stationCode);
    if (!station) {
      throw new NotFoundException(`Station ${stationCode} not found`);
    }

    // 2. Fetch full features from database
    const features = await this.buildStationFeatures(stationCode);
    if (!features) {
      throw new NotFoundException('No current AQI data to forecast from.');
    }

    const currentAqi = features.aqi;

    // 3. Request Prediction from XGBoost Service
    let mlResponse;
    try {
      const { data } = await lastValueFrom(
        this.httpService.post<{ forecastAQI: number; confidence: number; category: string; riskLevel: string }>(
          `${this.mlServiceUrl}/predict/${horizon}`,
          { features },
          { timeout: 15000 },
        ),
      );
      mlResponse = data;
    } catch (err: any) {
      console.warn(
        'ML Service offline, using calculated rule-based forecast fallback:',
        err.message,
      );

      const hoursAhead = parseInt(horizon.replace('h', ''));
      const hourMultiplier =
        1 +
        0.1 * Math.sin(((new Date().getHours() + hoursAhead) * Math.PI) / 12);
      const forecastAQI = Math.round(currentAqi * hourMultiplier);

      const getAqiCategoryFallback = (val: number) => {
        if (val <= 50) return 'Good';
        if (val <= 100) return 'Moderate';
        if (val <= 150) return 'Poor';
        if (val <= 200) return 'Unhealthy';
        return 'Severe';
      };

      const getRiskLevelFallback = (val: number) => {
        if (val <= 100) return 'LOW';
        if (val <= 150) return 'MODERATE';
        if (val <= 200) return 'HIGH';
        return 'SEVERE';
      };

      mlResponse = {
        forecastAQI,
        confidence: 0.85 - hoursAhead / 240,
        category: getAqiCategoryFallback(forecastAQI),
        riskLevel: getRiskLevelFallback(forecastAQI),
      };
    }

    const { forecastAQI, confidence, category, riskLevel } = mlResponse;
    const hoursAhead = parseInt(horizon.replace('h', ''));

    // 4. Save to DB
    const saved = await this.repository.saveForecast({
      stationId: station.id,
      forecastAQI,
      confidence,
      hoursAhead,
      category,
      riskLevel,
      forecastType: horizon,
      modelVersion: 'v1.0',
    });

    return {
      ...saved,
      currentAQI: Math.round(currentAqi),
    } as any;
  }

  async getForecast24h(stationCode: string) {
    return this.generateForecast(stationCode, '24h');
  }
  async getForecast48h(stationCode: string) {
    return this.generateForecast(stationCode, '48h');
  }
  async getForecast72h(stationCode: string) {
    return this.generateForecast(stationCode, '72h');
  }

  async saveForecastResult(stationId: string, result: any, horizon: string) {
    const hoursAhead = parseInt(horizon.replace('h', ''));
    await this.repository.saveForecast({
      stationId,
      forecastAQI: result.forecastAQI,
      confidence: result.confidence,
      hoursAhead,
      category: result.category,
      riskLevel: result.riskLevel,
      forecastType: horizon,
      modelVersion: 'v1.0',
    });
  }

  async triggerRetraining() {
    try {
      const { data } = await lastValueFrom(
        this.httpService.post<any>(`${this.mlServiceUrl}/ml/train`, {}, { timeout: 5000 }),
      );
      return data;
    } catch(err) {
      throw new InternalServerErrorException("Failed to trigger ML training pipeline.");
    }
  }
}
