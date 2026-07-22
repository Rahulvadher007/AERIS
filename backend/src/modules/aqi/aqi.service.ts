import { Injectable } from '@nestjs/common';
import { AqiRepository } from './aqi.repository';
import { CreateAqiDto } from './dto/create-aqi.dto';
import { QueryHistoryDto } from './dto/query-history.dto';
import { getAqiCategory, getHealthRisk } from '../../common/utils/aqi.util';

@Injectable()
export class AqiService {
  constructor(private readonly repository: AqiRepository) {}

  async create(createAqiDto: CreateAqiDto) {
    return this.repository.create(createAqiDto);
  }

  async getLive(city?: string) {
    const results = await this.repository.getLatestForAllStations(city);
    return results.map((item) => {
      if (item.latestReading) {
        return {
          ...item,
          latestReading: {
            ...item.latestReading,
            category: getAqiCategory(item.latestReading.aqi),
            healthRisk: getHealthRisk(item.latestReading.aqi),
          },
        };
      }
      return item;
    });
  }

  async getHistory(query: QueryHistoryDto) {
    const { stationId, startDate, endDate, page = 1, limit = 50, city } = query;
    const skip = (page - 1) * limit;

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const result = await this.repository.findHistory(
      stationId,
      start,
      end,
      skip,
      limit,
      city,
    );

    const enrichedData = result.data.map((reading) => ({
      ...reading,
      category: getAqiCategory(reading.aqi),
      healthRisk: getHealthRisk(reading.aqi),
    }));

    return {
      ...result,
      data: enrichedData,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  async getStatistics(city?: string) {
    return this.repository.getStatistics(city);
  }
}
