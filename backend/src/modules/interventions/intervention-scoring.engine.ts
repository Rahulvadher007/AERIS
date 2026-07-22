export class InterventionScoringEngine {
  static computePriorityScore(
    aqi: number,
    forecastAQI: number,
    trafficCongestion: number,
    hotspotCount: number,
    windSpeed: number,
    humidity: number,
    temperature: number,
  ): { score: number; riskLevel: string; priority: string } {
    let score = 0;

    // 1. Current AQI Risk (max 40 points)
    if (aqi > 350) score += 40;
    else if (aqi > 250) score += 30;
    else if (aqi > 150) score += 20;
    else if (aqi > 100) score += 10;
    else score += 3;

    // 2. Forecast Trend Risk (max 20 points)
    // Elevate risk if forecast predicts worsening conditions
    if (forecastAQI > aqi * 1.2) {
      score += 20; // Critical upcoming degradation
    } else if (forecastAQI > aqi * 1.05) {
      score += 12; // Moderate upcoming degradation
    } else if (forecastAQI > aqi * 0.95) {
      score += 5; // Stable
    } // If improving significantly, 0 additional points

    // 3. Traffic Risk (max 20 points)
    if (trafficCongestion > 85) score += 20;
    else if (trafficCongestion > 70) score += 14;
    else if (trafficCongestion > 50) score += 8;
    else if (trafficCongestion > 30) score += 3;

    // 4. Hotspot Risk (max 10 points)
    if (hotspotCount >= 5) score += 10;
    else if (hotspotCount >= 3) score += 7;
    else if (hotspotCount >= 1) score += 4;

    // 5. Meteorological Risk (max 10 points)
    // Stagnant wind speed traps pollutants
    if (windSpeed < 2.0) {
      score += 5;
    } else if (windSpeed < 3.5) {
      score += 2;
    }
    // High humidity + low temperature increases winter smog trap risk
    if (humidity > 75 && temperature < 18) {
      score += 5;
    }

    // Cap score at 100
    score = Math.min(score, 100);

    // Map Risk and Priority
    let riskLevel = 'LOW';
    let priority = 'LOW';

    if (score >= 80) {
      riskLevel = 'EMERGENCY';
      priority = 'CRITICAL';
    } else if (score >= 60) {
      riskLevel = 'SEVERE';
      priority = 'HIGH';
    } else if (score >= 40) {
      riskLevel = 'HIGH';
      priority = 'MEDIUM';
    } else if (score >= 20) {
      riskLevel = 'MODERATE';
      priority = 'LOW';
    }

    return { score, riskLevel, priority };
  }
}
