import { Injectable, OnModuleInit } from '@nestjs/common';
import { HotspotsRepository } from './hotspots.repository';
import { GisService } from '../gis/gis.service';
import * as turf from '@turf/helpers';
import clustersDbscan from '@turf/clusters-dbscan';
import { featureEach } from '@turf/meta';
import center from '@turf/center';
import distance from '@turf/distance';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

@Injectable()
export class HotspotsService implements OnModuleInit {
  constructor(
    private readonly repository: HotspotsRepository,
    private readonly gisService: GisService,
  ) {}

  async onModuleInit() {
    try {
      await this.calculateAndStoreHotspots();
    } catch (e) {
      // DB may not be ready yet on cold start — hotspots will be computed on first request
    }
  }

  async calculateAndStoreHotspots() {
    const THRESHOLD = parseInt(process.env.HOTSPOT_AQI_THRESHOLD || '150');
    const EPSILON = parseFloat(process.env.DBSCAN_EPSILON || '5');
    const MIN_POINTS = parseInt(process.env.DBSCAN_MIN_POINTS || '3');

    const readings = await this.gisService['repository'].getRecentAqiReadings();

    const severeReadings = readings.filter((r) => r.aqi && r.aqi >= THRESHOLD);
    if (!severeReadings.length) return;

    const points = turf.featureCollection(
      severeReadings.map((r) =>
        turf.point([r.longitude, r.latitude], { ...r }),
      ),
    );

    const clustered = clustersDbscan(points, EPSILON, {
      units: 'kilometers',
      minPoints: MIN_POINTS,
    });

    const clusters: Record<string, any[]> = {};
    featureEach(clustered, (currentFeature: any) => {
      const clusterId = currentFeature.properties.cluster;
      if (clusterId !== undefined && clusterId !== null) {
        if (!clusters[clusterId]) clusters[clusterId] = [];
        clusters[clusterId].push(currentFeature);
      }
    });

    const zones = await this.gisService['repository'].getAllZones();
    const hotspotsToInsert = [];

    for (const [clusterId, features] of Object.entries(clusters)) {
      const featureColl = turf.featureCollection(features);
      const centerPoint = center(featureColl);
      const centerCoords = centerPoint.geometry.coordinates;

      let maxDist = 0;
      let sumAQI = 0;
      let sumPM25 = 0;
      let sumPM10 = 0;

      features.forEach((f) => {
        const dist = distance(centerPoint, f, 'kilometers');
        if (dist > maxDist) maxDist = dist;
        sumAQI += f.properties.aqi;
        sumPM25 += f.properties.pm25 || 0;
        sumPM10 += f.properties.pm10 || 0;
      });

      const avgAQI = sumAQI / features.length;
      let severity = 'LOW';
      if (avgAQI > 350) severity = 'CRITICAL';
      else if (avgAQI > 250) severity = 'HIGH';
      else if (avgAQI >= 150) severity = 'MEDIUM';

      let assignedZoneId = null;
      for (const zone of zones) {
        if (zone.geometry) {
          const poly = turf.polygon((zone.geometry as any).coordinates);
          if (booleanPointInPolygon(centerPoint, poly)) {
            assignedZoneId = zone.id;
            break;
          }
        }
      }

      hotspotsToInsert.push({
        zoneId: assignedZoneId,
        clusterId: `cluster_${clusterId}`,
        latitude: centerCoords[1],
        longitude: centerCoords[0],
        aqi: avgAQI,
        pm25: sumPM25 / features.length,
        pm10: sumPM10 / features.length,
        stationCount: features.length,
        radius: maxDist,
        severity,
      });
    }

    await this.repository.deleteAll();
    await this.repository.createMany(hotspotsToInsert);
  }

  async getHotspots(city?: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const result = await this.repository.findAll(city, skip, limit);
    return {
      data: result.data,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getLatestHotspots(city?: string) {
    const result = await this.repository.findAll(city, 0, 200);
    return result.data;
  }

  async getHotspotById(id: string) {
    return this.repository.findById(id);
  }

  async getZoneHotspots(zoneId: string) {
    return this.repository.findByZone(zoneId);
  }
}
