import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PrometheusService } from './prometheus.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Get()
  async getMetrics(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/plain');
    const metrics = await this.prometheusService.getMetrics();
    res.send(metrics);
  }
}
