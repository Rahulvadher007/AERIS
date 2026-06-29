import { Module } from '@nestjs/common';
import { AqiController } from './aqi.controller';
import { AqiService } from './aqi.service';
import { AqiRepository } from './aqi.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AqiController],
  providers: [AqiService, AqiRepository],
  exports: [AqiService],
})
export class AqiModule {}
