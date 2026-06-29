import { Injectable, Logger } from '@nestjs/common';
import { ForecastService } from '../modules/forecast/forecast.service';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ForecastAgent {
  private readonly logger = new Logger(ForecastAgent.name);

  constructor(
    private readonly forecastService: ForecastService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Generates forecasts (24h, 48h, 72h) for all active stations.
   */
  async executeForecasts(): Promise<any[]> {
    this.logger.log('Forecast Agent: Starting predictive forecasting sweep...');
    const stations = await this.prisma.station.findMany();
    const results: any[] = [];

    const batchSize = 30;
    for (let i = 0; i < stations.length; i += batchSize) {
      const batch = stations.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (station) => {
          try {
            const f24 = await this.forecastService.generateForecast(station.stationCode, '24h');
            const f48 = await this.forecastService.generateForecast(station.stationCode, '48h');
            const f72 = await this.forecastService.generateForecast(station.stationCode, '72h');

            results.push({
              stationCode: station.stationCode,
              forecasts: { '24h': f24, '48h': f48, '72h': f72 },
            });
          } catch (err: any) {
            this.logger.error(`Forecast Agent: Failed to forecast for station ${station.stationCode}: ${err.message}`);
          }
        })
      );
    }

    this.logger.log(`Forecast Agent: Successfully generated forecasts for ${results.length} stations.`);
    return results;
  }
}
