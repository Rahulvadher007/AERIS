import { Injectable } from '@nestjs/common';
import { TrafficRepository } from './traffic.repository';
import { getCongestionSeverity } from './traffic.util';
import * as turf from '@turf/helpers';

@Injectable()
export class TrafficService {
  constructor(private readonly repository: TrafficRepository) {}

  async createRecord(data: any) {
    return this.repository.createTrafficData(data);
  }

  async getHistory(filters: any) {
    const { page = 1, limit = 50 } = filters;
    const result = await this.repository.getTrafficHistory(filters);
    return {
      data: result.data,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getLatestTraffic(city?: string) {
    return this.repository.getLatestTraffic(city);
  }

  async getStatistics(city?: string) {
    return this.repository.getTrafficStatistics(city);
  }

  async getZoneAnalytics(city?: string) {
    return this.repository.getZoneAnalytics(city);
  }

  async getCongestionHotspots(city?: string) {
    const hotspots = await this.repository.getCongestionHotspots(city);
    
    // Generate FeatureCollection for hotspots
    const features = hotspots.map(h => {
      const lineString = h.road.geometry as any;
      return turf.feature(lineString, {
        roadName: h.road.roadName,
        congestionScore: h.congestionScore,
        severity: getCongestionSeverity(h.congestionScore),
        averageSpeed: h.averageSpeed,
        timestamp: h.timestamp,
      });
    });

    return turf.featureCollection(features);
  }
}
