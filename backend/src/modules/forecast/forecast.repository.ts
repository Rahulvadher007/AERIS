import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ForecastRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getLatestAqi(stationId: string) {
    const reading = await this.prisma.aqiReading.findFirst({
      where: { stationId },
      orderBy: { timestamp: 'desc' },
    });
    return reading?.aqi ?? null;
  }

  async getYesterdayAqi(stationId: string) {
    const now = new Date();
    const yesterdayStart = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const yesterdayEnd = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const agg = await this.prisma.aqiReading.aggregate({
      where: {
        stationId,
        timestamp: { gte: yesterdayStart, lte: yesterdayEnd },
      },
      _avg: { aqi: true },
    });
    return agg._avg.aqi;
  }

  async getWeeklyAverageAqi(stationId: string) {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const agg = await this.prisma.aqiReading.aggregate({
      where: {
        stationId,
        timestamp: { gte: lastWeek },
      },
      _avg: { aqi: true },
    });
    return agg._avg.aqi;
  }

  async saveForecast(data: { stationId: string, forecastAQI: number, confidence: number, hoursAhead: number, category: string, riskLevel: string, forecastType: string, modelVersion: string }) {
    const forecastDate = new Date(Date.now() + data.hoursAhead * 60 * 60 * 1000);
    return this.prisma.forecastResult.create({
      data: {
        stationId: data.stationId,
        forecastAQI: data.forecastAQI,
        confidence: data.confidence,
        category: data.category,
        riskLevel: data.riskLevel,
        forecastType: data.forecastType,
        modelVersion: data.modelVersion,
        forecastDate,
      },
    });
  }
}
