import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ForecastController } from './forecast.controller';
import { ForecastService } from './forecast.service';
import { ForecastRepository } from './forecast.repository';
import { DatabaseModule } from '../../database/database.module';
import { StationsModule } from '../stations/stations.module';

@Module({
  imports: [
    DatabaseModule,
    StationsModule,
    HttpModule.register({ timeout: 30000, maxRedirects: 0 }),
  ],
  controllers: [ForecastController],
  providers: [ForecastService, ForecastRepository],
  exports: [ForecastService],
})
export class ForecastModule {}
