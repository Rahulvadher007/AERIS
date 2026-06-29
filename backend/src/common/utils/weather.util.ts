export function getTemperatureCategory(temp: number): string {
  if (temp < 15) return 'Cold';
  if (temp <= 25) return 'Mild';
  if (temp <= 35) return 'Warm';
  return 'Hot';
}

export function getHumidityCategory(humidity: number): string {
  if (humidity < 30) return 'Dry';
  if (humidity <= 60) return 'Comfortable';
  return 'Humid';
}

export function getWindCategory(speed: number): string {
  if (speed < 10) return 'Calm';
  if (speed <= 25) return 'Breezy';
  return 'Windy';
}
