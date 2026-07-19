import { Test, TestingModule } from '@nestjs/testing';
import { LandUseService } from './landuse.service';
import { PrismaService } from '../../database/prisma.service';

describe('LandUseService', () => {
  let service: LandUseService;
  const prismaMock = { landUseFeature: { findMany: jest.fn(), createMany: jest.fn() } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LandUseService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = module.get(LandUseService);
  });

  it('computes industrial percentage from features', () => {
    const features = [
      { category: 'INDUSTRIAL' }, { category: 'INDUSTRIAL' },
      { category: 'MAJOR_ROAD' }, { category: 'HOSPITAL' },
    ];
    const out = service.summarize(features as any);
    expect(out.industrialPct).toBe(50);
    expect(out.pois.hospital).toBe(1);
  });
});
