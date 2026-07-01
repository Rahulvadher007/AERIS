import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security & Optimization
  app.use(helmet());
  app.use(compression());
  
  // CORS Configuration
  if (process.env.NODE_ENV === 'production') {
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'https://aeris.vercel.app',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
  } else {
    app.enableCors();
  }

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger (Development Only)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Urban AI Backend')
      .setDescription('AI-Powered Urban Air Quality Intelligence Platform API')
      .setVersion('1.0')
      .addTag('AQI')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  Logger.log(`AERIS API running on port ${port}`, 'Bootstrap');
}
bootstrap();
