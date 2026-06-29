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

  async findAll(city?: string) {
    if (city) {
      return this.prisma.station.findMany({ where: { city } });
    }
    return this.prisma.station.findMany();
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
