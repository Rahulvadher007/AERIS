import { Controller, Get, Query } from '@nestjs/common';
import { SatelliteService } from './satellite.service';

@Controller('satellite')
export class SatelliteController {
  constructor(private readonly satelliteService: SatelliteService) {}

  @Get('nearest')
  async nearest(@Query('lat') lat: number, @Query('lon') lon: number) {
    return this.satelliteService.getNearestReading(Number(lat), Number(lon));
  }
}
