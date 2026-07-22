import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { ForecastService } from './forecast.service';
import { ForecastRepository } from './forecast.repository';
import { StationsService } from '../stations/stations.service';
import { NotFoundException } from '@nestjs/common';

describe('ForecastService (ML Integration)', () => {
  let service: ForecastService;
  let mockHttpService: { post: jest.Mock };

  beforeEach(async () => {
    mockHttpService = { post: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForecastService,
        {
          provide: ForecastRepository,
          useValue: {
            getLatestAqi: jest.fn().mockResolvedValue(150),
            saveForecast: jest.fn().mockImplementation(
              (data: {
                stationId: string;
                forecastAQI: number;
                confidence: number;
                category: string;
                riskLevel: string;
                forecastType: string;
                modelVersion: string;
              }) =>
                Promise.resolve({
                  id: 'f1',
                  stationId: data.stationId,
                  forecastAQI: data.forecastAQI,
                  confidence: data.confidence,
                  category: data.category,
                  riskLevel: data.riskLevel,
                  forecastType: data.forecastType,
                  modelVersion: data.modelVersion,
                  forecastDate: new Date(),
                  createdAt: new Date(),
                }),
            ),
          },
        },
        {
          provide: StationsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue({ data: [
              { id: '1', stationCode: 'TEST01' }
            ]})
          },
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<ForecastService>(ForecastService);
  });

  it('should call Python ML API and return mapped forecast', async () => {
    mockHttpService.post.mockReturnValueOnce(of({
      data: {
        forecastAQI: 180,
        forecastPM25: 80,
        forecastPM10: 120,
        confidence: 0.85,
        category: 'Moderate',
        riskLevel: 'Medium Risk'
      }
    }));

    const result = await service.getForecast24h('TEST01');
    expect(result.forecastAQI).toBe(180);
    expect(result.category).toBe('Moderate');
    expect(mockHttpService.post).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/predict/24h',
      expect.objectContaining({ features: expect.any(Object) }),
      expect.objectContaining({ timeout: 15000 })
    );
  });

  it('should throw NotFoundException if station does not exist', async () => {
    await expect(service.getForecast24h('INVALID')).rejects.toThrow(
      NotFoundException,
    );
  });
});
