import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface BucketEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  private readonly buckets = new Map<string, BucketEntry>();
  private readonly windowMs = 60_000;
  private readonly maxRequests = 100;

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = this.buckets.get(ip);

    if (!entry || now > entry.resetAt) {
      this.buckets.set(ip, { count: 1, resetAt: now + this.windowMs });
      next();
      return;
    }

    entry.count++;
    if (entry.count > this.maxRequests) {
      res.status(HttpStatus.TOO_MANY_REQUESTS).json({
        success: false,
        message: 'Too many requests — try again later',
      });
      return;
    }

    next();
  }
}
