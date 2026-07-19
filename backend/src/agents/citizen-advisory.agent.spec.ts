import { Test, TestingModule } from '@nestjs/testing';
import { CitizenAdvisoryAgent } from './citizen-advisory.agent';
import { VulnerabilityService } from '../modules/vulnerability/vulnerability.service';
import { PrismaService } from '../database/prisma.service';

describe('CitizenAdvisoryAgent', () => {
  let agent: CitizenAdvisoryAgent;
  const vulnMock = { computeScore: jest.fn().mockResolvedValue({ score: 0.7, poiCounts: {} }) };
  const prismaMock = { advisory: { create: jest.fn().mockResolvedValue({}) } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitizenAdvisoryAgent,
        { provide: VulnerabilityService, useValue: vulnMock },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    agent = module.get(CitizenAdvisoryAgent);
  });

  it('selects Tamil for Chennai and includes vulnerability score', async () => {
    const zones = [{ id: 'z1', zoneName: 'T Nagar', city: 'Chennai' }];
    const out = await agent.generateAdvisories(zones as any, { Chennai: 180 }, { Chennai: 220 });
    expect(out[0].language).toBe('ta');
    expect(out[0].vulnerabilityScore).toBe(0.7);
    expect(out[0].message.length).toBeGreaterThan(0);
  });
});
