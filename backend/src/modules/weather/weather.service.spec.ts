import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { WeatherRepository } from './weather.repository';

describe('WeatherService', () => {
  let service: WeatherService;
  let repository: WeatherRepository;

  const mockWeatherRepository = {
    getLatestForAllStations: jest.fn(),
    findHistory: jest.fn(),
    getStationHistory: jest.fn(),
    getStatistics: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: WeatherRepository, useValue: mockWeatherRepository },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    repository = module.get<WeatherRepository>(WeatherRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLatest', () => {
    it('should enrich weather records with categories', async () => {
      mockWeatherRepository.getLatestForAllStations.mockResolvedValue([
        {
          station: { id: 's1', code: 'A1', name: 'Test', city: 'City' },
          latestWeather: {
            id: 'w1',
            temperature: 41,
            humidity: 80,
            windSpeed: 30,
            pressure: 1010,
            rainfall: 0,
            windDirection: 180,
            timestamp: new Date(),
          },
        },
      ]);

      const result = await service.getLatest();
      const first = result[0] as any;
      expect(first.latestWeather.temperatureCategory).toBeDefined();
      expect(first.latestWeather.humidityCategory).toBeDefined();
      expect(first.latestWeather.windCategory).toBeDefined();
    });
  });

  describe('getStationHistory', () => {
    it('should throw NotFoundException if no data', async () => {
      mockWeatherRepository.getStationHistory.mockResolvedValue([]);
      await expect(service.getStationHistory('invalid')).rejects.toThrow('No weather data found');
    });
  });
});
