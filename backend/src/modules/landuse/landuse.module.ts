import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { LandUseService } from './landuse.service';
import { LandUseController } from './landuse.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [LandUseController],
  providers: [LandUseService],
  exports: [LandUseService],
})
export class LandUseModule {}
