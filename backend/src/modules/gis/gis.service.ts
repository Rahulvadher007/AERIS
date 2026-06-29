import { Injectable } from '@nestjs/common';
import { GisRepository } from './gis.repository';
import * as turf from '@turf/helpers';
import pointsWithinPolygon from '@turf/points-within-polygon';

@Injectable()
export class GisService {
  constructor(private repository: GisRepository) {}

  async getHeatmap() {
    const readings = await this.repository.getRecentAqiReadings();
    
    const features = readings.map(r => 
      turf.point([r.longitude, r.latitude], {
        aqi: r.aqi,
        stationId: r.stationId,
      })
    );

    return turf.featureCollection(features);
  }

  async getZoneAnalytics() {
    const readings = await this.repository.getRecentAqiReadings();
    const zones = await this.repository.getAllZones();

    const points = turf.featureCollection(
      readings.map(r => turf.point([r.longitude, r.latitude], { aqi: r.aqi }))
    );

    return zones.map(zone => {
      let maxAQI = 0;
      let minAQI = Infinity;
      let sumAQI = 0;
      let stationCount = 0;

      if (zone.geometry) {
        const polygon = turf.polygon((zone.geometry as any).coordinates);
        const ptsWithin = pointsWithinPolygon(points, polygon);

        stationCount = ptsWithin.features.length;
        ptsWithin.features.forEach((f: any) => {
          const aqi = f.properties.aqi;
          sumAQI += aqi;
          if (aqi > maxAQI) maxAQI = aqi;
          if (aqi < minAQI) minAQI = aqi;
        });
      }

      const avgAqi = stationCount > 0 ? sumAQI / stationCount : 0;
      if (minAQI === Infinity) minAQI = 0;

      let severity = 'LOW';
      if (avgAqi > 250) severity = 'HIGH';
      else if (avgAqi > 150) severity = 'MEDIUM';

      return {
        zone: zone.zoneName,
        averageAQI: Math.round(avgAqi),
        maxAQI: Math.round(maxAQI),
        minAQI: Math.round(minAQI),
        stationCount,
        severity,
      };
    });
  }

  async getZonesGeoJson() {
    const zones = await this.repository.getAllZones();
    const features = zones
      .filter(z => z.geometry !== null)
      .map(z => {
        const geom = z.geometry as any;
        return turf.feature(geom, {
          id: z.id,
          zoneCode: z.zoneCode,
          zoneName: z.zoneName,
          city: z.city
        });
      });
    return turf.featureCollection(features);
  }
}
