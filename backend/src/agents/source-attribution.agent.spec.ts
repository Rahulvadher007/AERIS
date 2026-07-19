import { Test, TestingModule } from '@nestjs/testing';
import { SourceAttributionAgent } from './source-attribution.agent';
import { PrismaService } from '../database/prisma.service';
import { SatelliteService } from '../modules/satellite/satellite.service';
import { LandUseService } from '../modules/landuse/landuse.service';

describe('SourceAttributionAgent', () => {
  let agent: SourceAttributionAgent;
  const satMock = { getNearestReading: jest.fn().mockResolvedValue({ no2: 0.0002, thermalAnomaly: 350 }) };
  const luMock = { getLandUseForZone: jest.fn().mockResolvedValue({ industrialPct: 40, constructionPct: 10, roadDensity: 5 }) };
  const prismaMock = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SourceAttributionAgent,
        { provide: PrismaService, useValue: prismaMock },
        { provide: SatelliteService, useValue: satMock },
        { provide: LandUseService, useValue: luMock },
      ],
    }).compile();
    agent = module.get(SourceAttributionAgent);
  });

  it('returns percentages summing to 100 with confidence in [0,1]', async () => {
    const zones = [{ id: 'z1', zoneName: 'Ward A', city: 'Delhi', roads: [{ id: 'r1' }] }];
    const out = await agent.attributeSources(zones as any, { r1: 80 }, { Delhi: 1.5 });
    const a = out[0].attribution;
    const sum = a.traffic + a.industry + a.construction + a.biomassBurning + a.background;
    expect(sum).toBe(100);
    expect(out[0].confidence).toBeGreaterThanOrEqual(0);
    expect(out[0].confidence).toBeLessThanOrEqual(1);
  });
});
