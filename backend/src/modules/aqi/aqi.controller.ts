import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { AqiService } from './aqi.service';
import { CreateAqiDto } from './dto/create-aqi.dto';
import { QueryHistoryDto } from './dto/query-history.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('AQI')
@Controller('aqi')
export class AqiController {
  constructor(private readonly aqiService: AqiService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new AQI reading' })
  create(@Body() createAqiDto: CreateAqiDto) {
    return this.aqiService.create(createAqiDto);
  }

  @Get('live')
  @ApiOperation({ summary: 'Get latest AQI readings for all stations' })
  getLive(@Query('city') city?: string) {
    return this.aqiService.getLive(city);
  }

  @Get('history')
  @ApiOperation({ summary: 'Query historical AQI data' })
  getHistory(@Query() query: QueryHistoryDto) {
    return this.aqiService.getHistory(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get overall AQI statistics' })
  getStatistics(@Query('city') city?: string) {
    return this.aqiService.getStatistics(city);
  }
}
