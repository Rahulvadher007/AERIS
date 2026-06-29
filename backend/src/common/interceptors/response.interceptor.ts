import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => {
        let message = 'Operation successful';
        let actualData = data;

        // If the service returns an object with a specific message, extract it.
        if (data && typeof data === 'object' && 'message' in data && 'data' in data) {
          message = data.message;
          actualData = data.data;
        }

        return {
          success: true,
          message,
          data: actualData ?? {},
        };
      }),
    );
  }
}
