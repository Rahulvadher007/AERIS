import { Module } from '@nestjs/common';
import { StationsController } from './stations.controller';
import { StationsService } from './stations.service';
import { StationsRepository } from './stations.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [StationsController],
  providers: [StationsService, StationsRepository],
  exports: [StationsService],
})
export class StationsModule {}
