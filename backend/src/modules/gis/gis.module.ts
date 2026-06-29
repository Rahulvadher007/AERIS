import { Module } from '@nestjs/common';
import { GisController } from './gis.controller';
import { GisService } from './gis.service';
import { GisRepository } from './gis.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GisController],
  providers: [GisService, GisRepository],
  exports: [GisService],
})
export class GisModule {}
