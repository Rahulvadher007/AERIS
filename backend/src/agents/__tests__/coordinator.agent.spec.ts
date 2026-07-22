import { Test, TestingModule } from '@nestjs/testing';
import { CoordinatorAgent } from '../coordinator.agent';
import { AQIAgent } from '../aqi.agent';
import { WeatherAgent } from '../weather.agent';
import { TrafficAgent } from '../traffic.agent';
import { ForecastAgent } from '../forecast.agent';
import { HotspotAgent } from '../hotspot.agent';
import { SourceAttributionAgent } from '../source-attribution.agent';
import { InterventionAgent } from '../intervention.agent';
import { CitizenAdvisoryAgent } from '../citizen-advisory.agent';
import { PrismaService } from '../../database/prisma.service';
import { PrometheusService } from '../../common/metrics/prometheus.service';

describe('CoordinatorAgent', () => {
  let coordinator: CoordinatorAgent;
  let aqiAgent: AQIAgent;
  let weatherAgent: WeatherAgent;
  let trafficAgent: TrafficAgent;
  let forecastAgent: ForecastAgent;
  let hotspotAgent: HotspotAgent;
  let sourceAttributionAgent: SourceAttributionAgent;
  let interventionAgent: InterventionAgent;
  let citizenAdvisoryAgent: CitizenAdvisoryAgent;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoordinatorAgent,
        {
          provide: AQIAgent,
          useValue: {
            processReadings: jest
              .fn()
              .mockResolvedValue([{ id: '1', aqi: 50, stationId: 's1' }]),
          },
        },
        {
          provide: WeatherAgent,
          useValue: {
            processWeather: jest
              .fn()
              .mockResolvedValue([
                { id: '1', windSpeed: 3.0, stationId: 's1' },
              ]),
          },
        },
        {
          provide: TrafficAgent,
          useValue: {
            processTraffic: jest
              .fn()
              .mockResolvedValue([
                { id: '1', congestionScore: 40, roadId: 'r1' },
              ]),
          },
        },
        {
          provide: ForecastAgent,
          useValue: {
            executeForecasts: jest.fn().mockResolvedValue([
              {
                id: '1',
                stationCode: 'DEL001',
                forecasts: { '24h': { forecastAQI: 55 } },
              },
            ]),
          },
        },
        {
          provide: HotspotAgent,
          useValue: {
            detectHotspots: jest
              .fn()
              .mockResolvedValue([{ id: '1', severity: 'HIGH', aqi: 150 }]),
          },
        },
        {
          provide: SourceAttributionAgent,
          useValue: {
            attributeSources: jest
              .fn()
              .mockResolvedValue([{ source: 'traffic', contribution: 40 }]),
          },
        },
        {
          provide: InterventionAgent,
          useValue: {
            planInterventions: jest
              .fn()
              .mockResolvedValue([{ id: '1', title: 'Test' }]),
          },
        },
        {
          provide: CitizenAdvisoryAgent,
          useValue: {
            generateAdvisories: jest
              .fn()
              .mockResolvedValue([{ id: '1', message: 'Test' }]),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            aqiReading: { findMany: jest.fn().mockResolvedValue([]) },
            weatherData: { findMany: jest.fn().mockResolvedValue([]) },
            trafficData: { findMany: jest.fn().mockResolvedValue([]) },
            zone: { findMany: jest.fn().mockResolvedValue([]) },
            station: { findMany: jest.fn().mockResolvedValue([]) },
          },
        },
        {
          provide: PrometheusService,
          useValue: {
            observeAgentSweep: jest.fn(),
            observeAgentStep: jest.fn(),
          },
        },
      ],
    }).compile();

    coordinator = module.get<CoordinatorAgent>(CoordinatorAgent);
    aqiAgent = module.get<AQIAgent>(AQIAgent);
    weatherAgent = module.get<WeatherAgent>(WeatherAgent);
    trafficAgent = module.get<TrafficAgent>(TrafficAgent);
    forecastAgent = module.get<ForecastAgent>(ForecastAgent);
    hotspotAgent = module.get<HotspotAgent>(HotspotAgent);
    sourceAttributionAgent = module.get<SourceAttributionAgent>(
      SourceAttributionAgent,
    );
    interventionAgent = module.get<InterventionAgent>(InterventionAgent);
    citizenAdvisoryAgent =
      module.get<CitizenAdvisoryAgent>(CitizenAdvisoryAgent);
  });

  it('should call all agents and return summary', async () => {
    const result = await coordinator.coordinateSweep();
    expect(result.success).toBe(true);
    expect(result.summary.validatedAqiCount).toBeGreaterThan(0);
    expect(result.summary.forecastStationsCount).toBeGreaterThan(0);
  });

  it('should run G1 agents (all called)', async () => {
    const aqiSpy = jest.spyOn(aqiAgent, 'processReadings');
    const weatherSpy = jest.spyOn(weatherAgent, 'processWeather');
    const trafficSpy = jest.spyOn(trafficAgent, 'processTraffic');

    await coordinator.coordinateSweep();

    expect(aqiSpy).toHaveBeenCalled();
    expect(weatherSpy).toHaveBeenCalled();
    expect(trafficSpy).toHaveBeenCalled();
  });

  it('should handle agent failure gracefully', async () => {
    jest
      .spyOn(aqiAgent, 'processReadings')
      .mockRejectedValue(new Error('AQI agent failed'));
    await expect(coordinator.coordinateSweep()).rejects.toThrow(
      'AQI agent failed',
    );
  });
});
