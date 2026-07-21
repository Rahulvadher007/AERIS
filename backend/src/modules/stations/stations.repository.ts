import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';

@Injectable()
export class StationsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateStationDto) {
    return this.prisma.station.create({ data });
  }

  async findAll(city?: string, skip = 0, take = 50) {
    const where: any = {};
    if (city) where.city = city;

    const [data, total] = await Promise.all([
      this.prisma.station.findMany({ where, skip, take }),
      this.prisma.station.count({ where }),
    ]);
    return { data, total };
  }

  async findUniqueCities() {
    const stations = await this.prisma.station.findMany({
      select: { city: true },
      distinct: ['city'],
    });
    return stations.map(s => s.city).filter(Boolean).sort();
  }

  async findById(id: string) {
    return this.prisma.station.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateStationDto) {
    return this.prisma.station.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.station.delete({
      where: { id },
    });
  }
}
