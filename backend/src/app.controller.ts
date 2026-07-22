import { Controller, Get, Logger, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './database/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: any,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async health() {
    const start = Date.now();

    let dbStatus = 'down';
    let dbLatency = 0;
    try {
      const dbStart = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - dbStart;
      dbStatus = 'up';
    } catch (err: any) {
      this.logger.error(`Database health check failed: ${err.message}`);
    }

    let redisStatus = 'down';
    let redisLatency = 0;
    try {
      const redisStart = Date.now();
      await this.cacheManager.set('health:ping', 1, 5000);
      await this.cacheManager.get('health:ping');
      redisLatency = Date.now() - redisStart;
      redisStatus = 'up';
    } catch (err: any) {
      this.logger.error(`Redis health check failed: ${err.message}`);
    }

    const overallStatus = dbStatus === 'up' ? 'healthy' : 'degraded';

    return {
      status: overallStatus,
      database: { status: dbStatus, latencyMs: dbLatency },
      redis: { status: redisStatus, latencyMs: redisLatency },
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
