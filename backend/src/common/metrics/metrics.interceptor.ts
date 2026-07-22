import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { Response } from 'express';
import { PrometheusService } from './prometheus.service';

interface HttpRequest {
  method: string;
  url: string;
  route?: { path?: string };
}

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly prometheusService: PrometheusService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const request: HttpRequest = http.getRequest();
    const method = request.method;
    const path = request.route?.path ?? request.url;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = http.getResponse<Response>();
        this.prometheusService.recordHttpRequest(
          method,
          path,
          response.statusCode,
          Date.now() - start,
        );
      }),
    );
  }
}
