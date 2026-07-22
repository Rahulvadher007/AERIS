import { Test, TestingModule } from '@nestjs/testing';
import { HotspotsService } from './hotspots.service';
import { HotspotsRepository } from './hotspots.repository';
import { GisService } from '../gis/gis.service';

describe('HotspotsService', () => {
  let service: HotspotsService;
  let repository: HotspotsRepository;
  let gisService: GisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HotspotsService,
        {
          provide: HotspotsRepository,
          useValue: {
            createMany: jest.fn().mockResolvedValue(true),
            findAll: jest.fn().mockResolvedValue([]),
            findByZone: jest.fn().mockResolvedValue([]),
            findById: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: GisService,
          useValue: {
            repository: {
              getRecentAqiReadings: jest.fn().mockResolvedValue([
                // Cluster 1 (Close together, high AQI)
                {
                  stationId: '1',
                  latitude: 12.9,
                  longitude: 77.5,
                  aqi: 280,
                  pm25: 120,
                  pm10: 150,
                },
                {
                  stationId: '2',
                  latitude: 12.91,
                  longitude: 77.51,
                  aqi: 290,
                  pm25: 130,
                  pm10: 160,
                },
                {
                  stationId: '3',
                  latitude: 12.92,
                  longitude: 77.52,
                  aqi: 300,
                  pm25: 140,
                  pm10: 170,
                },
                // Noise (Far away, low AQI)
                { stationId: '4', latitude: 28.6, longitude: 77.2, aqi: 50 },
              ]),
              getAllZones: jest.fn().mockResolvedValue([
                {
                  id: 'zone_1',
                  zoneName: 'Zone 1',
                  geometry: {
                    type: 'Polygon',
                    coordinates: [
                      [
                        [77.0, 12.0],
                        [78.0, 12.0],
                        [78.0, 13.0],
                        [77.0, 13.0],
                        [77.0, 12.0],
                      ],
                    ],
                  },
                },
              ]),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HotspotsService>(HotspotsService);
    repository = module.get<HotspotsRepository>(HotspotsRepository);
    gisService = module.get<GisService>(GisService);

    (gisService as any)['repository'] = (gisService as any).repository;

    process.env.HOTSPOT_AQI_THRESHOLD = '150';
    process.env.DBSCAN_EPSILON = '15'; // km
    process.env.DBSCAN_MIN_POINTS = '2';
  });

  it('should run DBSCAN clustering and store hotspots', async () => {
    await service.calculateAndStoreHotspots();

    // It should find 1 cluster out of the 3 severe points (the 4th is filtered out as < 150)
    expect(repository.createMany).toHaveBeenCalled();
    const callArgs = (repository.createMany as jest.Mock).mock.calls[0][0];

    expect(callArgs).toHaveLength(1);
    expect(callArgs[0]).toMatchObject({
      zoneId: 'zone_1',
      stationCount: 3,
      severity: 'HIGH',
    });
    expect(callArgs[0].radius).toBeGreaterThan(0);
    expect(callArgs[0].aqi).toBe(290); // Average of 280, 290, 300
  });
});
