import { Test, TestingModule } from '@nestjs/testing';
import { GisService } from './gis.service';
import { GisRepository } from './gis.repository';
import * as turf from '@turf/turf';

describe('GisService', () => {
  let service: GisService;
  let repository: GisRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GisService,
        {
          provide: GisRepository,
          useValue: {
            getRecentAqiReadings: jest.fn().mockResolvedValue([
              {
                stationId: '1',
                latitude: 12.9716,
                longitude: 77.5946,
                aqi: 180,
              },
              { stationId: '2', latitude: 12.98, longitude: 77.6, aqi: 260 },
            ]),
            getAllZones: jest.fn().mockResolvedValue([
              {
                id: 'z1',
                zoneName: 'Central Zone',
                geometry: {
                  type: 'Polygon',
                  coordinates: [
                    [
                      [77.5, 12.9],
                      [77.7, 12.9],
                      [77.7, 13.0],
                      [77.5, 13.0],
                      [77.5, 12.9],
                    ],
                  ],
                },
              },
            ]),
          },
        },
      ],
    }).compile();

    service = module.get<GisService>(GisService);
    repository = module.get<GisRepository>(GisRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a GeoJSON heatmap', async () => {
    const heatmap = await service.getHeatmap();
    expect(heatmap.type).toBe('FeatureCollection');
    expect(heatmap.features.length).toBe(2);
    const geom: any = heatmap.features[0].geometry;
    expect(geom.type).toBe('Point');
    expect(heatmap.features[0].properties?.aqi).toBe(180);
  });

  it('should calculate zone analytics', async () => {
    const analytics = await service.getZoneAnalytics();
    expect(analytics.length).toBe(1);
    expect(analytics[0].zone).toBe('Central Zone');
    expect(analytics[0].stationCount).toBe(2);
    expect(analytics[0].averageAQI).toBe(220); // (180 + 260) / 2
    expect(analytics[0].maxAQI).toBe(260);
    expect(analytics[0].minAQI).toBe(180);
    expect(analytics[0].severity).toBe('MEDIUM');
  });
});
