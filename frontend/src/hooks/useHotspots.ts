import { useQuery } from '@tanstack/react-query';
import { hotspotService } from '@/services/hotspot.service';
import { useCity } from '@/contexts/city-context';

export function useHotspots(enablePolling = false) {
  const { selectedCity, isLoadingCities } = useCity();
  return useQuery({
    queryKey: ['hotspots', selectedCity],
    queryFn: () => hotspotService.getAll(selectedCity),
    refetchInterval: enablePolling ? 30000 : false,
    enabled: !!selectedCity && !isLoadingCities,
  });
}
