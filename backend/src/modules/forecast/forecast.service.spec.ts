import { Test, TestingModule } from '@nestjs/testing';
import { ForecastService } from './forecast.service';
import { ForecastRepository } from './forecast.repository';
import { StationsService } from '../stations/stations.service';
import { NotFoundException } from '@nestjs/common';

// Mock global fetch
global.fetch = jest.fn();

describe('ForecastService (ML Integration)', () => {
  let service: ForecastService;
  let mockFetch: jest.Mock;

  beforeEach(async () => {
    mockFetch = global.fetch as jest.Mock;
    mockFetch.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForecastService,
        {
          provide: ForecastRepository,
          useValue: {
            getLatestAqi: jest.fn().mockResolvedValue(150),
            saveForecast: jest.fn().mockResolvedValue(true)
          },
        },
        {
          provide: StationsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([
              { id: '1', stationCode: 'TEST01' }
            ])
          },
        },
      ],
    }).compile();

    service = module.get<ForecastService>(ForecastService);
  });

  it('should call Python ML API and return mapped forecast', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        forecastAQI: 180,
        forecastPM25: 80,
        forecastPM10: 120,
        confidence: 0.85,
        category: 'Moderate',
        riskLevel: 'Medium Risk'
      })
    });

    const result = await service.getForecast24h('TEST01');
    expect(result.forecastAQI).toBe(180);
    expect(result.category).toBe('Moderate');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/predict/24h',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should throw NotFoundException if station does not exist', async () => {
    await expect(service.getForecast24h('INVALID')).rejects.toThrow(NotFoundException);
  });
});
