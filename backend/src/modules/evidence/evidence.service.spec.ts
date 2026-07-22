import { Test, TestingModule } from '@nestjs/testing';
import { EvidenceService } from './evidence.service';
import { PrismaService } from '../../database/prisma.service';

describe('EvidenceService', () => {
  let service: EvidenceService;
  const prismaMock = {
    forecastResult: { findMany: jest.fn().mockResolvedValue([]) },
    aqiReading: { findMany: jest.fn().mockResolvedValue([]) },
    hotspot: { findMany: jest.fn().mockResolvedValue([]) },
    intervention: { findMany: jest.fn().mockResolvedValue([]) },
    station: {
      findMany: jest
        .fn()
        .mockResolvedValue([{ city: 'Delhi' }, { city: 'Mumbai' }]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvidenceService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(EvidenceService);
  });

  it('returns evidence object with all keys', async () => {
    const ev = await service.getEvidence();
    expect(ev).toHaveProperty('rmseVsPersistence');
    expect(ev).toHaveProperty('attributionConfidenceAvg');
    expect(ev).toHaveProperty('signalToInterventionMins');
    expect(ev.multiCityCount).toBe(2);
  });
});
