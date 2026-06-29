export function getCongestionSeverity(score: number): string {
  if (score <= 25) return 'LOW';
  if (score <= 50) return 'MODERATE';
  if (score <= 75) return 'HIGH';
  return 'SEVERE';
}

export function classifyTrafficImpact(congestion: number, aqiIncrease: boolean, aqiSpikeRatio: number = 0) {
  if (congestion > 80 && aqiSpikeRatio > 0.2) {
    return { impact: 'HIGH', reason: 'High congestion directly correlates with a >20% AQI increase' };
  }
  if (congestion > 70 && aqiIncrease) {
    return { impact: 'HIGH', reason: 'High congestion correlated with increased pollution levels' };
  }
  if (congestion > 50 && aqiIncrease) {
    return { impact: 'MODERATE', reason: 'Moderate congestion contributing to steady pollution levels' };
  }
  return { impact: 'LOW', reason: 'Traffic congestion is not heavily impacting AQI' };
}
