import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ForecastRepository } from './forecast.repository';
import { StationsService } from '../stations/stations.service';

@Injectable()
export class ForecastService {
  private mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

  constructor(
    private readonly repository: ForecastRepository,
    private readonly stationsService: StationsService,
    private readonly httpService: HttpService,
  ) {}

  async generateForecast(stationCode: string, horizon: string) {
    // 1. Validate station
    const stations = await this.stationsService.findAll();
    const station = stations.data.find(s => s.stationCode === stationCode);
    if (!station) {
      throw new NotFoundException(`Station ${stationCode} not found`);
    }

    // 2. Fetch basic latest features to pass to ML
    const currentAqi = await this.repository.getLatestAqi(station.id);
    if (!currentAqi) throw new NotFoundException('No current AQI data to forecast from.');

    const features = {
      aqi: currentAqi,
      hour: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      month: new Date().getMonth() + 1,
    };

    // 3. Request Prediction from XGBoost Service
    let mlResponse;
    try {
      const { data } = await lastValueFrom(
        this.httpService.post(`${this.mlServiceUrl}/predict/${horizon}`, { features }, { timeout: 15000 }),
      );
      mlResponse = data;
    } catch (err: any) {
      console.warn("ML Service offline, using calculated rule-based forecast fallback:", err.message);
      
      const hoursAhead = parseInt(horizon.replace('h', ''));
      const hourMultiplier = 1 + 0.1 * Math.sin((new Date().getHours() + hoursAhead) * Math.PI / 12);
      const forecastAQI = Math.round(currentAqi * hourMultiplier);
      
      const getAqiCategoryFallback = (val: number) => {
        if (val <= 50) return 'Good';
        if (val <= 100) return 'Moderate';
        if (val <= 150) return 'Poor';
        if (val <= 200) return 'Unhealthy';
        return 'Severe';
      };
      
      const getRiskLevelFallback = (val: number) => {
        if (val <= 100) return 'LOW';
        if (val <= 150) return 'MODERATE';
        if (val <= 200) return 'HIGH';
        return 'SEVERE';
      };

      mlResponse = {
        forecastAQI,
        confidence: 0.85 - (hoursAhead / 240),
        category: getAqiCategoryFallback(forecastAQI),
        riskLevel: getRiskLevelFallback(forecastAQI),
      };
    }

    const { forecastAQI, confidence, category, riskLevel } = mlResponse;
    const hoursAhead = parseInt(horizon.replace('h', ''));

    // 4. Save to DB
    await this.repository.saveForecast({
      stationId: station.id,
      forecastAQI,
      confidence,
      hoursAhead,
      category,
      riskLevel,
      forecastType: horizon,
      modelVersion: 'v1.0'
    });

    return {
      station: stationCode,
      currentAQI: Math.round(currentAqi),
      ...mlResponse,
    };
  }

  async getForecast24h(stationCode: string) { return this.generateForecast(stationCode, '24h'); }
  async getForecast48h(stationCode: string) { return this.generateForecast(stationCode, '48h'); }
  async getForecast72h(stationCode: string) { return this.generateForecast(stationCode, '72h'); }

  async saveForecastResult(stationId: string, result: any, horizon: string) {
    const hoursAhead = parseInt(horizon.replace('h', ''));
    await this.repository.saveForecast({
      stationId,
      forecastAQI: result.forecastAQI,
      confidence: result.confidence,
      hoursAhead,
      category: result.category,
      riskLevel: result.riskLevel,
      forecastType: horizon,
      modelVersion: 'v1.0',
    });
  }

  async triggerRetraining() {
    try {
      const { data } = await lastValueFrom(
        this.httpService.post(`${this.mlServiceUrl}/ml/train`, {}, { timeout: 5000 }),
      );
      return data;
    } catch(err) {
      throw new InternalServerErrorException("Failed to trigger ML training pipeline.");
    }
  }
}
