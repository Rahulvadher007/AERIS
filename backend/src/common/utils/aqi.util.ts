export function getAqiCategory(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

export function getHealthRisk(aqi: number): string {
  if (aqi < 50) return 'Low Risk';
  if (aqi <= 100) return 'Moderate Risk';
  if (aqi <= 200) return 'Sensitive Groups';
  if (aqi <= 300) return 'High Risk';
  return 'Severe Risk';
}
