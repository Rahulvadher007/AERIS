import { Test, TestingModule } from '@nestjs/testing';
import { TrafficService } from './traffic.service';
import { TrafficRepository } from './traffic.repository';

describe('TrafficService', () => {
  let service: TrafficService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrafficService,
        {
          provide: TrafficRepository,
          useValue: {
            getCongestionHotspots: jest.fn().mockResolvedValue([
              {
                id: '1',
                road: { roadName: 'NH48', geometry: { type: 'LineString', coordinates: [[0,0], [1,1]] } },
                congestionScore: 85,
                averageSpeed: 10,
                timestamp: new Date()
              }
            ]),
          },
        },
      ],
    }).compile();

    service = module.get<TrafficService>(TrafficService);
  });

  it('should format congestion hotspots as GeoJSON', async () => {
    const hotspots = await service.getCongestionHotspots();
    expect(hotspots.type).toBe('FeatureCollection');
    expect(hotspots.features.length).toBe(1);
    expect(hotspots.features[0].properties?.severity).toBe('SEVERE');
    expect(hotspots.features[0].properties?.roadName).toBe('NH48');
  });
});
