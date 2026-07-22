import { Controller, Get, Query } from '@nestjs/common';
import { LandUseService } from './landuse.service';

@Controller('landuse')
export class LandUseController {
  constructor(private readonly landUseService: LandUseService) {}

  @Get('zone')
  async zone(
    @Query('city') city: string,
    @Query('lat') lat: number,
    @Query('lon') lon: number,
  ) {
    return this.landUseService.fetchAndStore(city, Number(lat), Number(lon));
  }
}
