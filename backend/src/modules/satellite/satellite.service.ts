import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SatelliteService {
  private readonly logger = new Logger(SatelliteService.name);

  constructor(private readonly prisma: PrismaService) {}

  normalizeSignals(raw: { no2?: number; so2?: number; thermal?: number }) {
    return {
      no2: raw.no2 ?? null,
      so2: raw.so2 ?? null,
      thermalAnomaly: raw.thermal ?? null,
      timestamp: new Date(),
      source: 'SENTINEL5P_MODIS',
    };
  }

  async getNearestReading(lat: number, lon: number, maxAgeHours = 24) {
    const since = new Date(Date.now() - maxAgeHours * 3600 * 1000);
    return this.prisma.satelliteReading.findFirst({
      where: { latitude: { gte: lat - 0.5, lte: lat + 0.5 }, longitude: { gte: lon - 0.5, lte: lon + 0.5 }, timestamp: { gte: since } },
      orderBy: { timestamp: 'desc' },
    });
  }

  async ingestCity(city: string, lat: number, lon: number) {
    const signals = await this.fetchSignals(lat, lon);
    const normalized = this.normalizeSignals(signals);
    await this.prisma.satelliteReading.create({
      data: { city, latitude: lat, longitude: lon, ...normalized },
    });
    return normalized;
  }

  private async fetchSignals(lat: number, lon: number) {
    const firmsKey = process.env.NASA_FIRMS_KEY;
    if (!firmsKey) {
      this.logger.warn('No NASA_FIRMS_KEY; satellite signals unavailable (fallback only).');
      return {};
    }
    try {
      const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${firmsKey}/VIIRS_SNPP_NRT/world/1/${lat}/${lon}/1`;
      const res = await fetch(url);
      if (!res.ok) return {};
      const text = await res.text();
      const lines = text.trim().split('\n').slice(1);
      if (lines.length === 0) return {};
      const last = lines[lines.length - 1].split(',');
      return {
        thermal: parseFloat(last[8] || '0'),
      };
    } catch (e) {
      this.logger.warn(`Satellite fetch failed: ${e.message}`);
      return {};
    }
  }
}
