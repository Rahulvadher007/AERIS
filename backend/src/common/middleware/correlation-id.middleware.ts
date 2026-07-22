import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { correlationIdStorage } from '../logger/structured-logger';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger('CorrelationId');

  use(req: Request, res: Response, next: NextFunction) {
    const correlationId =
      (req.headers['x-correlation-id'] as string) || randomUUID();
    (req as any).correlationId = correlationId;
    res.setHeader('x-correlation-id', correlationId);

    correlationIdStorage.run(correlationId, () => {
      next();
    });
  }
}
