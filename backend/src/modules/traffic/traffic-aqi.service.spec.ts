import { Test, TestingModule } from '@nestjs/testing';
import { TrafficAQICorrelationService } from './traffic-aqi.service';
import { TrafficRepository } from './traffic.repository';
import { PrismaService } from '../../database/prisma.service';

describe('TrafficAQICorrelationService', () => {
  let service: TrafficAQICorrelationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrafficAQICorrelationService,
        {
          provide: TrafficRepository,
          useValue: {
            getTrafficForCorrelation: jest.fn().mockResolvedValue([
              { congestionScore: 85 },
              { congestionScore: 60 }
            ]),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            road: {
              findUnique: jest.fn().mockResolvedValue({ id: '1', roadName: 'Test Road', zoneId: 'zone1' })
            },
            station: { findMany: jest.fn() },
            aqiReading: {
              findMany: jest.fn().mockResolvedValue([
                { aqi: 100 },
                { aqi: 150 } // 50% increase
              ])
            }
          },
        },
      ],
    }).compile();

    service = module.get<TrafficAQICorrelationService>(TrafficAQICorrelationService);
  });

  it('should correlate high congestion with AQI spikes', async () => {
    const result = await service.correlateTrafficWithAQI('1', new Date());
    expect(result).toBeDefined();
    expect(result?.aqiImpact).toBe('HIGH');
    expect(result?.congestionScore).toBe(85);
    expect(result?.aqiSpikeRatio).toBe('50.0%');
  });
});
