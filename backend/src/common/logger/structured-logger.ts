import { LoggerService } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export const correlationIdStorage = new AsyncLocalStorage<string | undefined>();

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  correlationId?: string;
  module: string;
  message: string;
  durationMs?: number;
  error?: { name: string; message: string; stack?: string };
  metadata?: Record<string, unknown>;
}

export class StructuredLogger implements LoggerService {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  log(message: string, meta?: Record<string, unknown>) {
    this.emit('info', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.emit('warn', message, meta);
  }

  error(message: string, trace?: string, meta?: Record<string, unknown>) {
    this.emit('error', message, { ...meta, stack: trace });
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.emit('debug', message, meta);
  }

  private emit(level: LogEntry['level'], message: string, meta?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module: this.context,
      message,
      correlationId: correlationIdStorage.getStore() || undefined,
      ...meta,
    };
    process.stdout.write(JSON.stringify(entry) + '\n');
  }
}
