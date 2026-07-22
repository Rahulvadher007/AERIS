import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { CacheInterceptor } from './common/interceptors/cache.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import compression from 'compression';
import { StructuredLogger } from './common/logger/structured-logger';
import { MetricsInterceptor } from './common/metrics/metrics.interceptor';
import { PrometheusService } from './common/metrics/prometheus.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new StructuredLogger('AERIS'),
  });

  // Security & Optimization
  app.use(helmet());
  app.use(compression());

  // CORS Configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  const cacheManager = app.get(CACHE_MANAGER);
  const prometheusService = app.get(PrometheusService);
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new CacheInterceptor(cacheManager),
    new MetricsInterceptor(prometheusService),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  app.setGlobalPrefix('api');

  // Swagger (opt-in via env var)
  if (process.env.SWAGGER_ENABLED === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Urban AI Backend')
      .setDescription('AI-Powered Urban Air Quality Intelligence Platform API')
      .setVersion('1.0')
      .addTag('AQI')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '127.0.0.1');
  const logger = new StructuredLogger('Bootstrap');
  logger.log(`AERIS API running on port ${port}`);
}
bootstrap();
