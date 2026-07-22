import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateWeatherDto } from './dto/create-weather.dto';

@Injectable()
export class WeatherRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateWeatherDto) {
    return this.prisma.weatherData.create({
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
        weatherData: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });
    return stations.map((st) => ({
      station: {
        id: st.id,
        code: st.stationCode,
        name: st.stationName,
        city: st.city,
      },
      latestWeather: st.weatherData[0] || null,
    }));
  }

  async findHistory(
    stationId?: string,
    city?: string,
    startDate?: Date,
    endDate?: Date,
    skip = 0,
    take = 50,
  ) {
    const where: any = {};
    if (stationId) where.stationId = stationId;
    if (city) {
      where.station = { city: { contains: city, mode: 'insensitive' } };
    }
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const [data, total] = await Promise.all([
      this.prisma.weatherData.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take,
        include: { station: { select: { stationCode: true, city: true } } },
      }),
      this.prisma.weatherData.count({ where }),
    ]);

    return { data, total };
  }

  async getStationHistory(stationId: string) {
    return this.prisma.weatherData.findMany({
      where: { stationId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getStatistics(city?: string) {
    const where: any = {};
    if (city) {
      where.station = { city };
    }
    const agg = await this.prisma.weatherData.aggregate({
      where,
      _avg: { temperature: true, humidity: true, windSpeed: true },
      _min: { temperature: true },
      _max: { temperature: true },
      _count: { id: true },
    });

    return {
      averageTemperature: agg._avg.temperature,
      averageHumidity: agg._avg.humidity,
      averageWindSpeed: agg._avg.windSpeed,
      minTemperature: agg._min.temperature,
      maxTemperature: agg._max.temperature,
      totalRecords: agg._count.id,
    };
  }
}
