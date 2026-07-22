import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId = (request as any).correlationId || 'unknown';
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === 'string'
          ? res
          : (res as any).message || exception.message;
      if (Array.isArray(message)) {
        message = message.join(', ');
      }
    } else if (exception instanceof Error) {
      if (exception.name === 'NotFoundError') {
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
      } else {
        message =
          process.env.NODE_ENV === 'production'
            ? 'Internal server error occurred'
            : exception.message;
      }
    }

    this.logger.error(
      `Request failed: ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : undefined,
      {
        path: request.url,
        method: request.method,
        statusCode: status,
        correlationId,
      },
    );

    response.status(status).json({
      success: false,
      message,
      correlationId,
      ...(process.env.NODE_ENV !== 'production' && exception instanceof Error
        ? { stack: exception.stack }
        : {}),
    });
  }
}
