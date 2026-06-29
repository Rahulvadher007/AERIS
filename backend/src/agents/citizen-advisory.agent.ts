import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CitizenAdvisoryAgent {
  private readonly logger = new Logger(CitizenAdvisoryAgent.name);

  /**
   * Generates public health advisories for residents.
   */
  async generateAdvisories(zones: any[], avgCityAqi: Record<string, number>, avgCityForecast: Record<string, number>): Promise<any[]> {
    this.logger.log(`Citizen Advisory Agent: Generating health advisories for ${zones.length} zones...`);
    const advisories = [];

    for (const zone of zones) {
      const aqi = avgCityAqi[zone.city] || 120;
      const forecastAQI = avgCityForecast[zone.city] || 150;
      
      const message = this.craftAdvisoryMessage(zone.zoneName, aqi, forecastAQI);

      advisories.push({
        zoneId: zone.id,
        zoneName: zone.zoneName,
        city: zone.city,
        currentAQI: aqi,
        forecastAQI,
        message,
        createdAt: new Date(),
      });
    }

    return advisories;
  }

  private craftAdvisoryMessage(zoneName: string, currentAQI: number, forecastAQI: number): string {
    let advisory = `Advisory for ${zoneName}: Current AQI is ${currentAQI}. `;

    if (forecastAQI > 300) {
      advisory += `Forecast predicts severe pollution levels (${forecastAQI} AQI) tomorrow. Extreme Risk. Action Required: Vulnerable groups, elderly, and children must remain indoors. Everyone should avoid outdoor activities, close windows, and wear N95 masks if transit is necessary.`;
    } else if (forecastAQI > 200) {
      advisory += `Forecast predicts very poor air quality (${forecastAQI} AQI) tomorrow. High Risk. Action Required: Limit prolonged outdoor exertion. Sensitive individuals should avoid strenuous outdoor activity. Consider using air purifiers indoors.`;
    } else if (forecastAQI > 100) {
      advisory += `Forecast predicts moderate air quality (${forecastAQI} AQI) tomorrow. Medium Risk. Action Required: Unusually sensitive people should consider reducing prolonged or heavy outdoor exertion.`;
    } else {
      advisory += `Forecast predicts good to satisfactory air quality (${forecastAQI} AQI) tomorrow. Low Risk. Outdoor activities can be safely conducted.`;
    }

    return advisory;
  }
}
