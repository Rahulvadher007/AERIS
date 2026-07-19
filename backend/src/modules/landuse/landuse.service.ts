import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class LandUseService {
  private readonly logger = new Logger(LandUseService.name);
  private cache = new Map<string, any>();

  constructor(private readonly prisma: PrismaService) {}

  summarize(features: { category: string }[]) {
    const total = features.length || 1;
    const count = (c: string) => features.filter((f) => f.category === c).length;
    return {
      industrialPct: Math.round((count('INDUSTRIAL') / total) * 100),
      constructionPct: Math.round((count('CONSTRUCTION') / total) * 100),
      roadDensity: count('MAJOR_ROAD'),
      pois: {
        hospital: count('HOSPITAL'),
        school: count('SCHOOL'),
        elderlyCare: count('ELDERLY_CARE'),
      },
    };
  }

  async getLandUseForZone(zone: { city: string; latitude?: number; longitude?: number }) {
    if (this.cache.has(zone.city)) return this.cache.get(zone.city);
    const features = await this.prisma.landUseFeature.findMany({ where: { city: zone.city } });
    const out = this.summarize(features);
    this.cache.set(zone.city, out);
    return out;
  }

  async fetchAndStore(city: string, lat: number, lon: number) {
    const url = process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter';
    const query = `[out:json];(node["amenity"~"hospital|school"](around:15000,${lat},${lon});way["landuse"~"industrial|construction"](around:15000,${lat},${lon}););out;`;
    try {
      const res = await fetch(url, { method: 'POST', body: 'data=' + encodeURIComponent(query) });
      if (!res.ok) throw new Error(`Overpass ${res.status}`);
      const json = await res.json();
      const rows = json.elements.map((e: any) => ({
        city,
        category: this.mapCategory(e),
        latitude: e.lat ?? e.center?.lat,
        longitude: e.lon ?? e.center?.lon,
        name: e.tags?.name ?? null,
      }));
      await this.prisma.landUseFeature.createMany({ data: rows, skipDuplicates: true });
      const out = this.summarize(rows);
      this.cache.set(city, out);
      return out;
    } catch (e) {
      this.logger.warn(`Overpass fetch failed for ${city}: ${e.message}`);
      return this.getLandUseForZone({ city });
    }
  }

  private mapCategory(e: any): string {
    const lu = e.tags?.landuse;
    if (lu === 'industrial') return 'INDUSTRIAL';
    if (lu === 'construction') return 'CONSTRUCTION';
    if (e.tags?.highway && ['motorway', 'trunk', 'primary'].includes(e.tags.highway)) return 'MAJOR_ROAD';
    if (e.tags?.amenity === 'hospital') return 'HOSPITAL';
    if (e.tags?.amenity === 'school') return 'SCHOOL';
    if (e.tags?.amenity === 'social_facility') return 'ELDERLY_CARE';
    return 'OTHER';
  }
}
