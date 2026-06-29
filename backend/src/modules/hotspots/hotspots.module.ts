import { Module } from '@nestjs/common';
import { HotspotsController } from './hotspots.controller';
import { HotspotsService } from './hotspots.service';
import { HotspotsRepository } from './hotspots.repository';
import { DatabaseModule } from '../../database/database.module';
import { GisModule } from '../gis/gis.module';

@Module({
  imports: [DatabaseModule, GisModule],
  controllers: [HotspotsController],
  providers: [HotspotsService, HotspotsRepository],
  exports: [HotspotsService],
})
export class HotspotsModule {}
