import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CacheModule } from './common/cache/cache.module';
import { StationsModule } from './modules/stations/stations.module';
import { AqiModule } from './modules/aqi/aqi.module';
import { ForecastModule } from './modules/forecast/forecast.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { WeatherModule } from './modules/weather/weather.module';
import { GisModule } from './modules/gis/gis.module';
import { HotspotsModule } from './modules/hotspots/hotspots.module';
import { TrafficModule } from './modules/traffic/traffic.module';
import { InterventionsModule } from './modules/interventions/interventions.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { SatelliteModule } from './modules/satellite/satellite.module';
import { LandUseModule } from './modules/landuse/landuse.module';
import { VulnerabilityModule } from './modules/vulnerability/vulnerability.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { AgentsModule } from './agents/agents.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { MetricsModule } from './common/metrics/metrics.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule,
    MetricsModule,
    DatabaseModule,
    StationsModule,
    AqiModule,
    ForecastModule,
    RecommendationsModule,
    WeatherModule,
    GisModule,
    HotspotsModule,
    TrafficModule,
    InterventionsModule,
    IngestionModule,
    SatelliteModule,
    LandUseModule,
    VulnerabilityModule,
    EvidenceModule,
    AgentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
