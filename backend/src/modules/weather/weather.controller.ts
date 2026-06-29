import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { QueryWeatherDto } from './dto/query-weather.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new weather record' })
  create(@Body() createWeatherDto: CreateWeatherDto) {
    return this.weatherService.create(createWeatherDto);
  }

  @Get()
  @ApiOperation({ summary: 'Query weather history' })
  getHistory(@Query() query: QueryWeatherDto) {
    return this.weatherService.getHistory(query);
  }

  @Get('live')
  @ApiOperation({ summary: 'Get latest weather data for all stations' })
  getLive(@Query('city') city?: string) {
    return this.weatherService.getLive(city);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get overall weather statistics' })
  getStatistics(@Query('city') city?: string) {
    return this.weatherService.getStatistics(city);
  }

  @Get(':stationId')
  @ApiOperation({ summary: 'Get weather history for a specific station' })
  getStationHistory(@Param('stationId') stationId: string) {
    return this.weatherService.getStationHistory(stationId);
  }
}
