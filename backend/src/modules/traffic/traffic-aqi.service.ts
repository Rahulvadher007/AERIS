import { Injectable } from '@nestjs/common';
import { TrafficRepository } from './traffic.repository';
import { classifyTrafficImpact } from './traffic.util';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TrafficAQICorrelationService {
  constructor(
    private readonly trafficRepo: TrafficRepository,
    private readonly prisma: PrismaService
  ) {}

  async correlateTrafficWithAQI(roadId: string, timestamp: Date) {
    const trafficLogs = await this.trafficRepo.getTrafficForCorrelation(roadId, timestamp);
    if (!trafficLogs.length) return null;

    const road = await this.prisma.road.findUnique({ where: { id: roadId } });
    if (!road || !road.zoneId) return null;

    // Find stations in this zone
    const stations = await this.prisma.station.findMany({
      // Approximating stations by finding AQI readings. Realistically, stations would map to zones.
      // Since our schema doesn't tie station to zone, we'll fetch all AQI and do a broad area check, 
      // or simply fetch recent AQI globally if this is a PoC.
    });

    // Fetch AQI readings in the 2 hour window
    const start = new Date(timestamp.getTime() - 2 * 60 * 60 * 1000);
    const end = new Date(timestamp.getTime() + 2 * 60 * 60 * 1000);
    
    const aqiLogs = await this.prisma.aqiReading.findMany({
      where: { timestamp: { gte: start, lte: end } },
      orderBy: { timestamp: 'asc' }
    });

    if (aqiLogs.length < 2) return null;

    // Calculate AQI trend
    const firstAqi = aqiLogs[0].aqi;
    const lastAqi = aqiLogs[aqiLogs.length - 1].aqi;
    const aqiIncrease = lastAqi > firstAqi;
    const aqiSpikeRatio = aqiIncrease ? (lastAqi - firstAqi) / firstAqi : 0;

    // Evaluate Traffic Impact for the worst congestion in the window
    let maxCongestion = 0;
    trafficLogs.forEach(t => { if (t.congestionScore > maxCongestion) maxCongestion = t.congestionScore; });

    const impact = classifyTrafficImpact(maxCongestion, aqiIncrease, aqiSpikeRatio);

    return {
      roadSegment: road.roadName,
      congestionScore: maxCongestion,
      aqiImpact: impact.impact,
      reason: impact.reason,
      aqiSpikeRatio: `${(aqiSpikeRatio * 100).toFixed(1)}%`
    };
  }

  async analyzeZoneCorrelation(zoneId: string) {
    // Aggregated correlation logic
    const roads = await this.prisma.road.findMany({ where: { zoneId } });
    const correlations = [];
    
    for (const road of roads) {
      const result = await this.correlateTrafficWithAQI(road.id, new Date());
      if (result) correlations.push(result);
    }

    return correlations;
  }
}
