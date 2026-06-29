export interface WeatherData {
  id: string;
  stationId: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  rainfall: number;
  createdAt: string;
}

export interface LatestWeatherItem {
  station: {
    id: string;
    code: string;
    name: string;
  };
  latestWeather: WeatherData | null;
}

export interface WeatherStatistics {
  averageTemperature?: number;
  averageHumidity?: number;
  averageWindSpeed?: number;
  totalRainfall?: number;
}
