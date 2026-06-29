import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SourceAttributionAgent {
  private readonly logger = new Logger(SourceAttributionAgent.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Estimates source contributions (Traffic, Industry, Construction, Background) per zone.
   */
  async attributeSources(zones: any[], trafficMap: Record<string, number>, windSpeedMap: Record<string, number>): Promise<any[]> {
    this.logger.log(`Source Attribution Agent: Apportioning sources for ${zones.length} zones...`);
    const attributions = [];

    for (const zone of zones) {
      // 1. Calculate Traffic Congestion average for the zone
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

      // 2. Hotspot Count
      const hotspotCount = zone.hotspots.length;

      // 3. Meteorological Stagnation Factor
      const windSpeed = windSpeedMap[zone.city] || 3.0;

      // 4. Compute weight-based attribution
      const trafficWeight = trafficCongestion * 0.8;
      const hotspotWeight = hotspotCount * 15;
      const stagnationWeight = windSpeed < 2.0 ? 40 : 10;
      const backgroundWeight = 15; // Constant background level

      const totalWeight = trafficWeight + hotspotWeight + stagnationWeight + backgroundWeight;

      const trafficPercent = Math.round((trafficWeight / totalWeight) * 100);
      const industryPercent = Math.max(10, Math.round((hotspotWeight / totalWeight) * 85));
      const constructionPercent = Math.round((backgroundWeight / totalWeight) * 100);
      const backgroundPercent = 100 - trafficPercent - industryPercent - constructionPercent;

      const attribution = {
        zoneId: zone.id,
        zoneName: zone.zoneName,
        city: zone.city,
        attribution: {
          traffic: trafficPercent,
          industry: industryPercent,
          construction: constructionPercent,
          background: backgroundPercent,
        },
        dominantSource: this.getDominantSource(trafficPercent, industryPercent, windSpeed),
      };

      attributions.push(attribution);
    }

    return attributions;
  }

  private getDominantSource(traffic: number, industry: number, windSpeed: number): string {
    if (windSpeed < 2.0) return 'METEOROLOGICAL_STAGNATION';
    if (traffic > industry) return 'VEHICULAR_TRAFFIC';
    if (industry > 25) return 'INDUSTRIAL_EMISSIONS';
    return 'MIXED_BACKGROUND';
  }
}
