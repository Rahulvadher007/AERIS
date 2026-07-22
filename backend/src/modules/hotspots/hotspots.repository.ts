import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HotspotsRepository {
  constructor(private prisma: PrismaService) {}

  async createMany(data: any[]) {
    if (!data.length) return;
    return this.prisma.hotspot.createMany({ data });
  }

  async deleteAll() {
    return this.prisma.hotspot.deleteMany();
  }

  async findAll(city?: string, skip = 0, take = 50) {
    const where: any = {};
    if (city) {
      where.zone = { city: { contains: city, mode: 'insensitive' } };
    }

    const [data, total] = await Promise.all([
      this.prisma.hotspot.findMany({
        where,
        orderBy: { detectedAt: 'desc' },
        include: { zone: { select: { zoneName: true } } },
        skip,
        take,
      }),
      this.prisma.hotspot.count({ where }),
    ]);
    return { data, total };
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
