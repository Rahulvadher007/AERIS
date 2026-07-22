import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAqiDto } from './dto/create-aqi.dto';

@Injectable()
export class AqiRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAqiDto) {
    return this.prisma.aqiReading.create({
      data: {
        ...data,
        timestamp: new Date(data.timestamp),
      },
    });
  }

  async getLatestForAllStations(city?: string) {
    const where: any = {};
    if (city) {
      where.city = city;
    }

    const stations = await this.prisma.station.findMany({
      where,
      include: {
        aqiReadings: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });
    return stations.map((st) => ({
      station: { id: st.id, code: st.stationCode, name: st.stationName },
      latestReading: st.aqiReadings[0] || null,
    }));
  }

  async findHistory(
    stationId?: string,
    startDate?: Date,
    endDate?: Date,
    skip = 0,
    take = 50,
    city?: string,
  ) {
    const where: any = {};
    if (stationId) where.stationId = stationId;
    if (city) where.station = { city };
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const [data, total] = await Promise.all([
      this.prisma.aqiReading.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take,
      }),
      this.prisma.aqiReading.count({ where }),
    ]);

    return { data, total };
  }

  async getStatistics(city?: string) {
    const where: any = {};
    if (city) where.station = { city };

    const agg = await this.prisma.aqiReading.aggregate({
      where,
      _avg: { aqi: true },
      _min: { aqi: true },
      _max: { aqi: true },
      _count: { id: true },
    });

    const stationsCount = await this.prisma.station.count({
      where: city ? { city } : undefined,
    });

    return {
      averageAQI: agg._avg.aqi,
      minimumAQI: agg._min.aqi,
      maximumAQI: agg._max.aqi,
      totalReadings: agg._count.id,
      totalStations: stationsCount,
    };
  }
}
