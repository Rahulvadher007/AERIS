import { Injectable, NotFoundException } from '@nestjs/common';
import { WeatherRepository } from './weather.repository';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { QueryWeatherDto } from './dto/query-weather.dto';
import { getTemperatureCategory, getHumidityCategory, getWindCategory } from '../../common/utils/weather.util';

@Injectable()
export class WeatherService {
  constructor(private readonly repository: WeatherRepository) {}

  async create(createWeatherDto: CreateWeatherDto) {
    return this.repository.create(createWeatherDto);
  }

  async getLive(city?: string) {
    const results = await this.repository.getLatestForAllStations(city);
    return results.map(item => {
      if (item.latestWeather) {
        return {
          ...item,
          latestWeather: {
            ...item.latestWeather,
            temperatureCategory: getTemperatureCategory(item.latestWeather.temperature),
            humidityCategory: getHumidityCategory(item.latestWeather.humidity),
            windCategory: getWindCategory(item.latestWeather.windSpeed),
          }
        };
      }
      return item;
    });
  }

  async getHistory(query: QueryWeatherDto) {
    const { stationId, city, startDate, endDate, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;
    
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const result = await this.repository.findHistory(stationId, city, start, end, skip, limit);

    const enrichedData = result.data.map(reading => ({
      ...reading,
      temperatureCategory: getTemperatureCategory(reading.temperature),
      humidityCategory: getHumidityCategory(reading.humidity),
      windCategory: getWindCategory(reading.windSpeed),
    }));

    return {
      data: enrichedData,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  async getStationHistory(stationId: string) {
    const data = await this.repository.getStationHistory(stationId);
    if (!data.length) {
      throw new NotFoundException(`No weather data found for station ID ${stationId}`);
    }
    return data.map(reading => ({
      ...reading,
      temperatureCategory: getTemperatureCategory(reading.temperature),
      humidityCategory: getHumidityCategory(reading.humidity),
      windCategory: getWindCategory(reading.windSpeed),
    }));
  }

  async getStatistics(city?: string) {
    return this.repository.getStatistics(city);
  }
}
