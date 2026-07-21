import { Controller, Get, Post, Query, Body, Param } from '@nestjs/common';
import { TrafficService } from './traffic.service';
import { TrafficAQICorrelationService } from './traffic-aqi.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Traffic Intelligence')
@Controller('traffic')
export class TrafficController {
  constructor(
    private readonly trafficService: TrafficService,
    private readonly correlationService: TrafficAQICorrelationService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create traffic record' })
  async createTrafficRecord(@Body() body: any) {
    return this.trafficService.createRecord(body);
  }

  @Get()
  @ApiOperation({ summary: 'Traffic history with filters' })
  @ApiQuery({ name: 'roadSegment', required: false })
  @ApiQuery({ name: 'zoneId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getHistory(@Query() query: any) {
    return this.trafficService.getHistory({
      roadSegment: query.roadSegment,
      zoneId: query.zoneId,
      startDate: query.startDate,
      endDate: query.endDate,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 50,
    });
  }

  @Get('latest')
  @ApiOperation({ summary: 'Latest traffic status across roads' })
  async getLatest(@Query('city') city?: string) {
    return this.trafficService.getLatestTraffic(city);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Network-wide traffic statistics' })
  async getStatistics(@Query('city') city?: string) {
    return this.trafficService.getStatistics(city);
  }

  @Get('congestion-hotspots')
  @ApiOperation({ summary: 'Returns highest congestion locations as GeoJSON' })
  async getCongestionHotspots(@Query('city') city?: string) {
    return this.trafficService.getCongestionHotspots(city);
  }

  @Get('zones')
  @ApiOperation({ summary: 'Zone-based traffic analytics' })
  async getZoneAnalytics(@Query('city') city?: string) {
    return this.trafficService.getZoneAnalytics(city);
  }

  @Get('correlate/:roadId')
  @ApiOperation({ summary: 'Correlate traffic congestion on a road to AQI impacts' })
  async correlateTrafficAQI(@Param('roadId') roadId: string, @Query('timestamp') timestamp: string) {
    const time = timestamp ? new Date(timestamp) : new Date();
    return this.correlationService.correlateTrafficWithAQI(roadId, time);
  }
}
