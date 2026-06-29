import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WeatherAgent {
  private readonly logger = new Logger(WeatherAgent.name);

  /**
   * Processes weather readings and computes dispersion indices.
   */
  async processWeather(weatherReadings: any[]): Promise<any[]> {
    this.logger.log(`Weather Agent: Processing ${weatherReadings.length} meteorological readings...`);
    
    return weatherReadings.map(w => {
      const dispersionIndex = this.calculateDispersionIndex(w.windSpeed, w.temperature, w.humidity);
      const weatherRiskScore = this.calculateWeatherRisk(dispersionIndex, w.humidity);

      return {
        ...w,
        dispersionIndex,
        weatherRiskScore,
        dispersionCategory: this.getDispersionCategory(dispersionIndex),
        processedAt: new Date(),
      };
    });
  }

  private calculateDispersionIndex(windSpeed: number, temp: number, humidity: number): number {
    // High wind speed and temperature increase dispersion. High humidity reduces it slightly.
    const windFactor = windSpeed * 2.0;
    const tempFactor = Math.max(5, temp) * 0.5;
    const humidityFactor = (100 - humidity) * 0.1;
    
    // Scale between 0 and 100
    const index = Math.min(100, Math.max(0, windFactor + tempFactor + humidityFactor));
    return Number(index.toFixed(1));
  }

  private calculateWeatherRisk(dispersionIndex: number, humidity: number): number {
    // Lower dispersion and higher humidity (smog trap) increase risk
    const risk = (100 - dispersionIndex) * 0.7 + (humidity * 0.3);
    return Math.min(100, Math.max(0, Math.round(risk)));
  }

  private getDispersionCategory(index: number): string {
    if (index > 75) return 'EXCELLENT';
    if (index > 50) return 'GOOD';
    if (index > 30) return 'MODERATE';
    return 'POOR';
  }
}
