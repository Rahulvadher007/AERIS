import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ForecastModule } from '../modules/forecast/forecast.module';
import { HotspotsModule } from '../modules/hotspots/hotspots.module';
import { InterventionsModule } from '../modules/interventions/interventions.module';
import { SatelliteModule } from '../modules/satellite/satellite.module';
import { LandUseModule } from '../modules/landuse/landuse.module';
import { VulnerabilityModule } from '../modules/vulnerability/vulnerability.module';

import { AQIAgent } from './aqi.agent';
import { WeatherAgent } from './weather.agent';
import { TrafficAgent } from './traffic.agent';
import { ForecastAgent } from './forecast.agent';
import { HotspotAgent } from './hotspot.agent';
import { SourceAttributionAgent } from './source-attribution.agent';
import { InterventionAgent } from './intervention.agent';
import { CitizenAdvisoryAgent } from './citizen-advisory.agent';
import { CoordinatorAgent } from './coordinator.agent';
import { AgentsController } from './agents.controller';

@Module({
  imports: [
    DatabaseModule,
    ForecastModule,
    HotspotsModule,
    InterventionsModule,
    SatelliteModule,
    LandUseModule,
    VulnerabilityModule,
  ],
  controllers: [AgentsController],
  providers: [
    AQIAgent,
    WeatherAgent,
    TrafficAgent,
    ForecastAgent,
    HotspotAgent,
    SourceAttributionAgent,
    InterventionAgent,
    CitizenAdvisoryAgent,
    CoordinatorAgent,
  ],
  exports: [
    AQIAgent,
    WeatherAgent,
    TrafficAgent,
    ForecastAgent,
    HotspotAgent,
    SourceAttributionAgent,
    InterventionAgent,
    CitizenAdvisoryAgent,
    CoordinatorAgent,
  ],
})
export class AgentsModule {}
