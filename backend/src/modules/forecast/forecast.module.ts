import { Module } from '@nestjs/common';
import { ForecastController } from './forecast.controller';
import { ForecastService } from './forecast.service';
import { ForecastRepository } from './forecast.repository';
import { DatabaseModule } from '../../database/database.module';
import { StationsModule } from '../stations/stations.module';

@Module({
  imports: [DatabaseModule, StationsModule],
  controllers: [ForecastController],
  providers: [ForecastService, ForecastRepository],
  exports: [ForecastService],
})
export class ForecastModule {}
