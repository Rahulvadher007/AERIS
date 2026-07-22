import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class GisRepository {
  constructor(private prisma: PrismaService) {}

  async getRecentAqiReadings() {
    const stations = await this.prisma.station.findMany({
      include: {
        aqiReadings: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    return stations
      .map((st) => {
        const reading = st.aqiReadings[0];
        return {
          stationId: st.id,
          latitude: st.latitude,
          longitude: st.longitude,
          aqi: reading ? reading.aqi : null,
        };
      })
      .filter((s) => s.aqi !== null);
  }

  async getAllZones() {
    return this.prisma.zone.findMany();
  }
}
