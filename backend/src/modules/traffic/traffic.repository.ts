import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TrafficRepository {
  constructor(private prisma: PrismaService) {}

  async createTrafficData(data: any) {
    return this.prisma.trafficData.create({ data });
  }

  async getTrafficHistory(filters: any) {
    const { roadSegment, zoneId, startDate, endDate, page = 1, limit = 50 } = filters;
    const where: any = {};

    if (roadSegment) where.roadId = roadSegment;
    if (zoneId) where.road = { zoneId };
    if (startDate && endDate) {
      where.timestamp = { gte: new Date(startDate), lte: new Date(endDate) };
    }

    const [data, total] = await Promise.all([
      this.prisma.trafficData.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { road: true },
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.trafficData.count({ where }),
    ]);
    return { data, total };
  }

  async getLatestTraffic(city?: string) {
    const where: any = {};
    if (city) {
      where.zone = { city: { contains: city, mode: 'insensitive' } };
    }
    // Get distinct roads' latest traffic
    const roads = await this.prisma.road.findMany({
      where,
      include: {
        traffic: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        }
      }
    });

    return roads.map(r => ({
      ...r,
      latestTraffic: r.traffic[0] || null
    }));
  }

  async getTrafficStatistics(city?: string) {
    const where: any = {};
    if (city) {
      where.road = { zone: { city: { contains: city, mode: 'insensitive' } } };
    }
    const aggs = await this.prisma.trafficData.aggregate({
      where,
      _avg: { congestionScore: true, averageSpeed: true },
      _max: { congestionScore: true },
      _sum: { vehicleCount: true },
    });

    return {
      averageCongestion: aggs._avg.congestionScore || 0,
      maxCongestion: aggs._max.congestionScore || 0,
      averageSpeed: aggs._avg.averageSpeed || 0,
      vehicleCount: aggs._sum.vehicleCount || 0,
    };
  }

  async getCongestionHotspots(city?: string) {
    const where: any = { congestionScore: { gte: 76 } };
    if (city) {
      where.road = { zone: { city: { contains: city, mode: 'insensitive' } } };
    }
    return this.prisma.trafficData.findMany({
      where,
      orderBy: { congestionScore: 'desc' },
      take: 20,
      include: { road: true },
    });
  }

  async getZoneAnalytics(city?: string) {
    const where: any = {};
    if (city) where.city = { contains: city, mode: 'insensitive' };
    const zones = await this.prisma.zone.findMany({
      where,
      include: {
        roads: {
          include: { traffic: { orderBy: { timestamp: 'desc' }, take: 50 } }
        }
      }
    });

    return zones.map(zone => {
      let totalCong = 0, peakCong = 0, vehicles = 0, counts = 0;
      zone.roads.forEach(r => {
        r.traffic.forEach(t => {
          totalCong += t.congestionScore;
          if (t.congestionScore > peakCong) peakCong = t.congestionScore;
          vehicles += t.vehicleCount;
          counts++;
        });
      });

      return {
        zone: zone.zoneName,
        averageCongestion: counts > 0 ? totalCong / counts : 0,
        peakCongestion: peakCong,
        vehicleCount: vehicles,
      };
    });
  }

  async getTrafficForCorrelation(roadId: string, timestamp: Date) {
    const start = new Date(timestamp.getTime() - 2 * 60 * 60 * 1000); // 2 hours before
    const end = new Date(timestamp.getTime() + 2 * 60 * 60 * 1000);   // 2 hours after
    return this.prisma.trafficData.findMany({
      where: { roadId, timestamp: { gte: start, lte: end } },
      orderBy: { timestamp: 'desc' }
    });
  }
}
