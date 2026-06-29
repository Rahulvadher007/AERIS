import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HotspotsRepository {
  constructor(private prisma: PrismaService) {}

  async createMany(data: any[]) {
    if (!data.length) return;
    return this.prisma.hotspot.createMany({ data });
  }

  async findAll(city?: string) {
    const where: any = {};
    if (city) {
      where.zone = { city: { contains: city, mode: 'insensitive' } };
    }
    return this.prisma.hotspot.findMany({
      where,
      orderBy: { detectedAt: 'desc' },
      include: { zone: { select: { zoneName: true } } },
    });
  }

  async findById(id: string) {
    return this.prisma.hotspot.findUnique({
      where: { id },
      include: { zone: { select: { zoneName: true } } },
    });
  }

  async findByZone(zoneId: string) {
    return this.prisma.hotspot.findMany({
      where: { zoneId },
      orderBy: { detectedAt: 'desc' },
    });
  }
}
