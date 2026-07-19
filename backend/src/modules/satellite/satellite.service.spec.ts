import { Test, TestingModule } from '@nestjs/testing';
import { SatelliteService } from './satellite.service';
import { PrismaService } from '../../database/prisma.service';

describe('SatelliteService', () => {
  let service: SatelliteService;
  const prismaMock = {
    satelliteReading: { create: jest.fn().mockResolvedValue({}), findFirst: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SatelliteService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = module.get(SatelliteService);
  });

  it('apportions no2/so2/thermal into a normalized reading object', () => {
    const out = service.normalizeSignals({
      no2: 0.00015, so2: 0.00003, thermal: 320,
    });
    expect(out.no2).toBeCloseTo(0.00015);
    expect(out.thermalAnomaly).toBe(320);
    expect(out.source).toBe('SENTINEL5P_MODIS');
  });
});
