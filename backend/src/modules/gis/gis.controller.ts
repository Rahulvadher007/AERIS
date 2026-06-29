import { Controller, Get } from '@nestjs/common';
import { GisService } from './gis.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('GIS & Analytics')
@Controller('gis')
export class GisController {
  constructor(private readonly gisService: GisService) {}

  @Get('heatmap')
  @ApiOperation({ summary: 'Get AQI Heatmap GeoJSON' })
  getHeatmap() {
    return this.gisService.getHeatmap();
  }

  @Get('zones')
  @ApiOperation({ summary: 'Get aggregated Zone AQI Analytics' })
  getZones() {
    return this.gisService.getZoneAnalytics();
  }

  @Get('zones-geojson')
  @ApiOperation({ summary: 'Get all Zones as GeoJSON FeatureCollection' })
  getZonesGeoJson() {
    return this.gisService.getZonesGeoJson();
  }
}
