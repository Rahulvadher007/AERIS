import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherRepository } from './weather.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [WeatherController],
  providers: [WeatherService, WeatherRepository],
  exports: [WeatherService],
})
export class WeatherModule {}
