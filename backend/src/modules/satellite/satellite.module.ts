import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { SatelliteService } from './satellite.service';
import { SatelliteController } from './satellite.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [SatelliteController],
  providers: [SatelliteService],
  exports: [SatelliteService],
})
export class SatelliteModule {}
