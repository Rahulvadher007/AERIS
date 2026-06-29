import { useQuery } from '@tanstack/react-query';
import { aqiService, QueryHistoryParams } from '@/services/aqi.service';
import { useCity } from '@/contexts/city-context';

export function useLiveAqi(enablePolling = false) {
  const { selectedCity, isLoadingCities } = useCity();
  return useQuery({
    queryKey: ['aqi', 'live', selectedCity],
    queryFn: () => aqiService.getLive(selectedCity),
    refetchInterval: enablePolling ? 30000 : false,
    enabled: !!selectedCity && !isLoadingCities,
  });
}

export function useAqiHistory(params?: QueryHistoryParams) {
  const { selectedCity, isLoadingCities } = useCity();
  const mergedParams = { ...params, city: selectedCity };
  return useQuery({
    queryKey: ['aqi', 'history', mergedParams],
    queryFn: () => aqiService.getHistory(mergedParams),
    enabled: !!selectedCity && !isLoadingCities,
  });
}

export function useAqiStatistics() {
  const { selectedCity, isLoadingCities } = useCity();
  return useQuery({
    queryKey: ['aqi', 'statistics', selectedCity],
    queryFn: () => aqiService.getStatistics(selectedCity),
    enabled: !!selectedCity && !isLoadingCities,
  });
}
