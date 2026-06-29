import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AQIAgent {
  private readonly logger = new Logger(AQIAgent.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validates raw pollutant readings and flags anomalies.
   * Also computes the CPCB AQI score.
   */
  async processReadings(readings: any[]): Promise<any[]> {
    this.logger.log(`AQI Agent: Analyzing and validating ${readings.length} raw readings...`);
    const processed = [];

    for (const r of readings) {
      const isOutlier = this.checkOutliers(r);
      const category = this.getAqiCategory(r.aqi);

      processed.push({
        ...r,
        isValid: !isOutlier,
        qaFlag: isOutlier ? 'ANOMALY_OUTLIER' : 'VALIDATED',
        category,
        processedAt: new Date(),
      });

      if (isOutlier) {
        this.logger.warn(`AQI Agent: Flagged anomaly for station ${r.stationId} at ${r.timestamp}: AQI=${r.aqi}, PM2.5=${r.pm25}`);
      }
    }

    return processed;
  }

  private checkOutliers(r: any): boolean {
    // Basic threshold bounds check
    if (r.aqi < 0 || r.aqi > 500) return true;
    if (r.pm25 < 0 || r.pm25 > 1000) return true;
    if (r.pm10 < 0 || r.pm10 > 1500) return true;
    return false;
  }

  private getAqiCategory(aqi: number): string {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Satisfactory';
    if (aqi <= 200) return 'Moderate';
    if (aqi <= 300) return 'Poor';
    if (aqi <= 400) return 'Very Poor';
    return 'Severe';
  }
}
