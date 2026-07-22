import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { HotspotsService } from './hotspots.service';
import { OffsetPaginationDto } from '../../common/dto/pagination.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Hotspots')
@Controller('hotspots')
export class HotspotsController {
  constructor(private readonly hotspotsService: HotspotsService) {}

  @Post('detect')
  @ApiOperation({ summary: 'Manually trigger DBSCAN hotspot detection' })
  async detectHotspots() {
    await this.hotspotsService.calculateAndStoreHotspots();
    return { success: true, message: 'DBSCAN hotspot detection completed' };
  }

  @Get()
  @ApiOperation({ summary: 'Get all active hotspots' })
  getAll(
    @Query('city') city?: string,
    @Query() pagination?: OffsetPaginationDto,
  ) {
    return this.hotspotsService.getHotspots(
      city,
      pagination?.page,
      pagination?.limit,
    );
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get the latest hotspot scan results' })
  getLatest(@Query('city') city?: string) {
    return this.hotspotsService.getLatestHotspots(city);
  }

  @Get('zone/:zoneId')
  @ApiOperation({ summary: 'Get hotspots for a specific zone' })
  getByZone(@Param('zoneId') zoneId: string) {
    return this.hotspotsService.getZoneHotspots(zoneId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific hotspot details' })
  getById(@Param('id') id: string) {
    return this.hotspotsService.getHotspotById(id);
  }
}
