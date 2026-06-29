import { useQuery } from '@tanstack/react-query';
import { trafficService, QueryTrafficParams } from '@/services/traffic.service';
import { useCity } from '@/contexts/city-context';

export function useLatestTraffic() {
  const { selectedCity, isLoadingCities } = useCity();
  return useQuery({
    queryKey: ['traffic', 'latest', selectedCity],
    queryFn: () => trafficService.getLatest(selectedCity),
    enabled: !!selectedCity && !isLoadingCities,
  });
}

export function useTrafficHistory(params?: QueryTrafficParams) {
  const { selectedCity, isLoadingCities } = useCity();
  const mergedParams = { ...params, city: selectedCity };
  return useQuery({
    queryKey: ['traffic', 'history', mergedParams],
    queryFn: () => trafficService.getHistory(mergedParams),
    enabled: !!selectedCity && !isLoadingCities,
  });
}

export function useTrafficStatistics() {
  const { selectedCity, isLoadingCities } = useCity();
  return useQuery({
    queryKey: ['traffic', 'statistics', selectedCity],
    queryFn: () => trafficService.getStatistics(selectedCity),
    enabled: !!selectedCity && !isLoadingCities,
  });
}

export function useCongestionHotspots() {
  const { selectedCity, isLoadingCities } = useCity();
  return useQuery({
    queryKey: ['traffic', 'congestion-hotspots', selectedCity],
    queryFn: () => trafficService.getCongestionHotspots(selectedCity),
    enabled: !!selectedCity && !isLoadingCities,
  });
}

export function useZoneTrafficAnalytics() {
  const { selectedCity, isLoadingCities } = useCity();
  return useQuery({
    queryKey: ['traffic', 'zones', selectedCity],
    queryFn: () => trafficService.getZoneAnalytics(selectedCity),
    enabled: !!selectedCity && !isLoadingCities,
  });
}
