import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class InterventionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.intervention.create({ data });
  }

  async createMany(data: any[]) {
    return this.prisma.intervention.createMany({ data });
  }

  async findAll(city?: string) {
    const where: any = {};
    if (city) {
      where.zone = { city: { contains: city, mode: 'insensitive' } };
    }
    return this.prisma.intervention.findMany({
      where,
      include: {
        zone: {
          include: {
            hotspots: { take: 5, orderBy: { detectedAt: 'desc' } },
            roads: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string) {
    return this.prisma.intervention.findUnique({
      where: { id },
      include: {
        zone: {
          include: {
            hotspots: { take: 5, orderBy: { detectedAt: 'desc' } },
            roads: true
          }
        }
      }
    });
  }

  async findByZone(zoneId: string) {
    return this.prisma.intervention.findMany({
      where: { zoneId },
      include: {
        zone: {
          include: {
            hotspots: { take: 5, orderBy: { detectedAt: 'desc' } },
            roads: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getDashboardMetrics(city?: string) {
    const where: any = {};
    if (city) {
      where.zone = { city: { contains: city, mode: 'insensitive' } };
    }
    const total = await this.prisma.intervention.count({ where });
    const critical = await this.prisma.intervention.count({ where: { ...where, priority: 'CRITICAL' } });
    const high = await this.prisma.intervention.count({ where: { ...where, priority: 'HIGH' } });
    
    // Most recent critical zones
    const criticalZones = await this.prisma.intervention.findMany({
      where: { ...where, priority: 'CRITICAL' },
      include: { zone: true },
      distinct: ['zoneId'],
      take: 10
    });

    return { total, critical, high, criticalZones };
  }
}
