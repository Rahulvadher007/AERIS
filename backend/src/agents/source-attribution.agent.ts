import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SatelliteService } from '../modules/satellite/satellite.service';
import { LandUseService } from '../modules/landuse/landuse.service';

@Injectable()
export class SourceAttributionAgent {
  private readonly logger = new Logger(SourceAttributionAgent.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly satellite: SatelliteService,
    private readonly landUse: LandUseService,
  ) {}

  async attributeSources(
    zones: any[],
    trafficMap: Record<string, number>,
    windSpeedMap: Record<string, number>,
  ): Promise<any[]> {
    const results = [];
    for (const zone of zones) {
      const sat = await this.satellite.getNearestReading(zone.latitude ?? 28.61, zone.longitude ?? 77.23).catch(() => null);
      const lu = await this.landUse.getLandUseForZone(zone).catch(() => ({ industrialPct: 20, constructionPct: 10, roadDensity: 3 }));

      const avgTraffic = zone.roads?.length
        ? zone.roads.reduce((s: number, r: any) => s + (trafficMap[r.id] ?? 35), 0) / zone.roads.length
        : 35;
      const windSpeed = windSpeedMap[zone.city] ?? 3.0;
      const no2 = sat?.no2 ?? 0;
      const thermal = sat?.thermalAnomaly ?? 0;

      const trafficW = avgTraffic * 0.8 + (lu.roadDensity || 0) * 2;
      const industryW = lu.industrialPct * 1.2 + no2 * 200000;
      const constructionW = lu.constructionPct * 1.5;
      const biomassW = thermal > 300 ? (thermal - 300) * 0.5 : 5;
      const backgroundW = 15 + (windSpeed < 2 ? 25 : 0);

      const total = trafficW + industryW + constructionW + biomassW + backgroundW || 1;
      const round = (w: number) => Math.round((w / total) * 100);
      let traffic = round(trafficW), industry = round(industryW), construction = round(constructionW), biomass = round(biomassW);
      let background = 100 - traffic - industry - construction - biomass;
      if (background < 0) { background = 0; }

      const signalsPresent = [!!sat, !!lu.industrialPct, avgTraffic > 0].filter(Boolean).length;
      const confidence = Number((0.4 + 0.2 * signalsPresent).toFixed(2));

      const dominantSource =
        biomass > industry && biomass > traffic ? 'BIOMASS_BURNING'
        : industry > traffic ? 'INDUSTRIAL_EMISSIONS'
        : windSpeed < 2 ? 'METEOROLOGICAL_STAGNATION'
        : 'VEHICULAR_TRAFFIC';

      results.push({
        zoneId: zone.id, zoneName: zone.zoneName, city: zone.city,
        attribution: { traffic, industry, construction, biomassBurning: biomass, background },
        dominantSource, confidence,
        supportingEvidence: [
          sat ? 'SENTINEL5P_NO2' : null,
          thermal ? 'MODIS_THERMAL' : null,
          'OSM_LANDUSE',
        ].filter(Boolean),
      });
    }
    return results;
  }
}
