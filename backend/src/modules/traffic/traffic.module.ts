import { Module } from '@nestjs/common';
import { TrafficController } from './traffic.controller';
import { TrafficService } from './traffic.service';
import { TrafficRepository } from './traffic.repository';
import { TrafficAQICorrelationService } from './traffic-aqi.service';

@Module({
  controllers: [TrafficController],
  providers: [TrafficService, TrafficRepository, TrafficAQICorrelationService],
  exports: [TrafficService, TrafficAQICorrelationService]
})
export class TrafficModule {}
