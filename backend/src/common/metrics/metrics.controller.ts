import { Controller, Get, Req, Res, ForbiddenException } from '@nestjs/common';
import type { Response, Request } from 'express';
import { PrometheusService } from './prometheus.service';

@Controller('metrics')
export class MetricsController {
  private readonly allowedInternalIps = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];

  constructor(private readonly prometheusService: PrometheusService) {}

  @Get()
  async getMetrics(@Req() req: Request, @Res() res: Response) {
    const ip = req.ip || req.socket?.remoteAddress || '';
    if (!this.allowedInternalIps.includes(ip)) {
      throw new ForbiddenException('Metrics are internal-only');
    }
    res.setHeader('Content-Type', 'text/plain');
    const metrics = await this.prometheusService.getMetrics();
    res.send(metrics);
  }
}
