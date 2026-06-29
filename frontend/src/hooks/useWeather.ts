import { useQuery } from '@tanstack/react-query';
import { weatherService, QueryWeatherParams } from '@/services/weather.service';
import { useCity } from '@/contexts/city-context';

export function useLatestWeather() {
  const { selectedCity, isLoadingCities } = useCity();
  return useQuery({
    queryKey: ['weather', 'latest', selectedCity],
    queryFn: () => weatherService.getLatest(selectedCity),
    enabled: !!selectedCity && !isLoadingCities,
  });
}

export function useWeatherHistory(params?: QueryWeatherParams) {
  const { selectedCity, isLoadingCities } = useCity();
  const mergedParams = { ...params, city: selectedCity };
  return useQuery({
    queryKey: ['weather', 'history', mergedParams],
    queryFn: () => weatherService.getHistory(mergedParams),
    enabled: !!selectedCity && !isLoadingCities,
  });
}

export function useWeatherStatistics() {
  const { selectedCity, isLoadingCities } = useCity();
  return useQuery({
    queryKey: ['weather', 'statistics', selectedCity],
    queryFn: () => weatherService.getStatistics(selectedCity),
    enabled: !!selectedCity && !isLoadingCities,
  });
}

export function useStationWeatherHistory(stationId: string) {
  return useQuery({
    queryKey: ['weather', 'station', stationId],
    queryFn: () => weatherService.getStationHistory(stationId),
    enabled: !!stationId,
  });
}
