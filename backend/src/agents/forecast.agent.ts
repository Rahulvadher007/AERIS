import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ForecastService } from '../modules/forecast/forecast.service';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ForecastAgent {
  private readonly logger = new Logger(ForecastAgent.name);
  private readonly mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

  constructor(
    private readonly forecastService: ForecastService,
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async executeForecasts(): Promise<any[]> {
    this.logger.log('Forecast Agent: Starting batch predictive forecasting sweep...');
    const stations = await this.prisma.station.findMany({ select: { id: true, stationCode: true } });
    const stationCodes = stations.map(s => s.stationCode);
    const results: any[] = [];

    for (const horizon of ['24h', '48h', '72h']) {
      try {
        const { data } = await lastValueFrom(
          this.httpService.post<{ results: any[] }>(
            `${this.mlServiceUrl}/predict/batch?horizon=${horizon}`,
            { stations: stationCodes },
            { timeout: 120000 },
          ),
        );

        for (const item of data.results) {
          if (item.error) {
            this.logger.warn(`Forecast Agent: No data for station ${item.stationCode}`);
            continue;
          }

          const station = stations.find(s => s.stationCode === item.stationCode);
          if (!station) continue;

          await this.forecastService.saveForecastResult(station.id, item, horizon);
          // Store in format expected by coordinator: { stationCode, forecasts: { '24h': { forecastAQI } } }
          const existing = results.find(r => r.stationCode === item.stationCode);
          if (existing) {
            existing.forecasts[horizon] = { forecastAQI: item.forecastAQI };
          } else {
            results.push({ stationCode: item.stationCode, forecasts: { [horizon]: { forecastAQI: item.forecastAQI } } });
          }
        }

        this.logger.log(`Forecast Agent: Completed ${horizon} for ${data.results.length} stations.`);
      } catch (err: any) {
        this.logger.error(`Forecast Agent: Batch ${horizon} failed: ${err.message}`);
        // Fallback: generate forecasts from DB AQI data
        for (const station of stations) {
          try {
            const latestAqi = await this.prisma.aqiReading.findFirst({
              where: { stationId: station.id },
              orderBy: { timestamp: 'desc' },
            });
            if (latestAqi) {
              const hoursAhead = parseInt(horizon.replace('h', ''));
              const hourMultiplier = 1 + 0.1 * Math.sin(((new Date().getHours() + hoursAhead) * Math.PI) / 12);
              const forecastAQI = Math.round(latestAqi.aqi * hourMultiplier);
              const category = forecastAQI <= 50 ? 'Good' : forecastAQI <= 100 ? 'Moderate' : forecastAQI <= 200 ? 'Poor' : 'Severe';
              const riskLevel = forecastAQI <= 100 ? 'LOW' : forecastAQI <= 200 ? 'MODERATE' : 'HIGH';
              await this.forecastService.saveForecastResult(station.id, { forecastAQI, confidence: 0.75, category, riskLevel }, horizon);
              // Store in format expected by coordinator
              const existing = results.find(r => r.stationCode === station.stationCode);
              if (existing) {
                existing.forecasts[horizon] = { forecastAQI };
              } else {
                results.push({ stationCode: station.stationCode, forecasts: { [horizon]: { forecastAQI } } });
              }
            }
          } catch (e) {
            this.logger.warn(`Forecast Agent: Fallback failed for ${station.stationCode}`);
          }
        }
      }
    }

    this.logger.log(`Forecast Agent: Successfully generated forecasts for ${results.length} records.`);
    return results;
  }
}
