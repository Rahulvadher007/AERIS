import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TrafficAgent {
  private readonly logger = new Logger(TrafficAgent.name);

  /**
   * Analyzes traffic records and correlates congestion with emission impacts.
   */
  async processTraffic(trafficReadings: any[]): Promise<any[]> {
    this.logger.log(
      `Traffic Agent: Analyzing ${trafficReadings.length} traffic segment records...`,
    );

    return trafficReadings.map((t) => {
      // Congestion score (0-100) maps directly to traffic AQI contribution
      const aqiContribution = this.estimateAqiContribution(t.congestionScore);
      const level = this.getCongestionLevel(t.congestionScore);

      return {
        ...t,
        congestionLevel: level,
        trafficAqiContribution: aqiContribution,
        processedAt: new Date(),
      };
    });
  }

  private estimateAqiContribution(congestionScore: number): number {
    // Linear proxy model: higher congestion -> higher PM2.5/NOx contribution in AQI points
    const baseContribution = 5;
    const congestionFactor = congestionScore * 0.75;
    return Math.round(baseContribution + congestionFactor);
  }

  private getCongestionLevel(score: number): string {
    if (score > 75) return 'SEVERE';
    if (score > 50) return 'HIGH';
    if (score > 25) return 'MODERATE';
    return 'LOW';
  }
}
