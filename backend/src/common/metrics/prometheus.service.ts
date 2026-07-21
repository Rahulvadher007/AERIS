import { Injectable, OnModuleInit } from '@nestjs/common';
import * as prometheus from 'prom-client';

@Injectable()
export class PrometheusService implements OnModuleInit {
  private httpRequestDuration: prometheus.Histogram<string>;
  private httpRequestsTotal: prometheus.Counter<string>;
  private agentSweepDuration: prometheus.Histogram<string>;
  private agentStepDuration: prometheus.Histogram<string>;
  private cacheHitsTotal: prometheus.Counter<string>;
  private cacheMissesTotal: prometheus.Counter<string>;

  onModuleInit() {
    prometheus.register.clear();

    this.httpRequestDuration = new prometheus.Histogram({
      name: 'http_request_duration_ms',
      help: 'HTTP request duration in ms',
      buckets: [5, 10, 50, 100, 200, 500, 1000, 3000],
      labelNames: ['method', 'path', 'status'],
    });

    this.httpRequestsTotal = new prometheus.Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'path', 'status'],
    });

    this.agentSweepDuration = new prometheus.Histogram({
      name: 'agent_sweep_duration_ms',
      help: 'Full agent sweep duration in ms',
      buckets: [1000, 5000, 10000, 30000],
    });

    this.agentStepDuration = new prometheus.Histogram({
      name: 'agent_step_duration_ms',
      help: 'Individual agent step duration in ms',
      buckets: [100, 500, 1000, 5000, 10000],
      labelNames: ['agent_name'],
    });

    this.cacheHitsTotal = new prometheus.Counter({
      name: 'cache_hits_total',
      help: 'Cache hit count',
      labelNames: ['endpoint'],
    });

    this.cacheMissesTotal = new prometheus.Counter({
      name: 'cache_misses_total',
      help: 'Cache miss count',
      labelNames: ['endpoint'],
    });
  }

  recordHttpRequest(method: string, path: string, status: number, durationMs: number) {
    this.httpRequestDuration.observe({ method, path, status: String(status) }, durationMs);
    this.httpRequestsTotal.inc({ method, path, status: String(status) });
  }

  observeAgentSweep(durationMs: number) {
    this.agentSweepDuration.observe(durationMs);
  }

  observeAgentStep(agentName: string, durationMs: number) {
    this.agentStepDuration.observe({ agent_name: agentName }, durationMs);
  }

  recordCacheHit(endpoint: string) {
    this.cacheHitsTotal.inc({ endpoint });
  }

  recordCacheMiss(endpoint: string) {
    this.cacheMissesTotal.inc({ endpoint });
  }

  async getMetrics(): Promise<string> {
    return prometheus.register.metrics();
  }
}
