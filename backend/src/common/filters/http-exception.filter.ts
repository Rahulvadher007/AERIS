import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message || exception.message;
      
      // If it's an array of validation errors, stringify them
      if (Array.isArray(message)) {
        message = message.join(', ');
      }
    } else if (exception instanceof Error) {
      // Catch Prisma or other uncaught errors
      if (exception.name === 'NotFoundError') {
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
      } else {
        message = process.env.NODE_ENV === 'production' 
          ? 'Internal server error occurred' 
          : exception.message;
      }
    }

    response.status(status).json({
      success: false,
      message,
    });
  }
}
