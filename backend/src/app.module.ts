import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
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
import { AgentsModule } from './agents/agents.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
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
    AgentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
