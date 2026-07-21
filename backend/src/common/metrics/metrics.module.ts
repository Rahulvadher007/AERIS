import { Module, Global } from '@nestjs/common';
import { PrometheusService } from './prometheus.service';
import { MetricsController } from './metrics.controller';

@Global()
@Module({
  controllers: [MetricsController],
  providers: [PrometheusService],
  exports: [PrometheusService],
})
export class MetricsModule {}
