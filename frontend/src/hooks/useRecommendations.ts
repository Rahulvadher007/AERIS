import { useQuery } from '@tanstack/react-query';
import { recommendationService } from '@/services/recommendation.service';
import { useCity } from '@/contexts/city-context';

export function useRecommendations(enablePolling = false) {
  const { selectedCity, isLoadingCities } = useCity();
  return useQuery({
    queryKey: ['recommendations', selectedCity],
    queryFn: () => recommendationService.getAll(selectedCity),
    refetchInterval: enablePolling ? 60000 : false,
    enabled: !!selectedCity && !isLoadingCities,
  });
}
