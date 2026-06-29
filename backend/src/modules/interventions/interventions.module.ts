import { Module } from '@nestjs/common';
import { InterventionsController } from './interventions.controller';
import { InterventionsService } from './interventions.service';
import { InterventionsRepository } from './interventions.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [InterventionsController],
  providers: [InterventionsService, InterventionsRepository],
  exports: [InterventionsService],
})
export class InterventionsModule {}
