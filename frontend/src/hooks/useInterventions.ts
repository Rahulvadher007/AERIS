import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interventionService } from '@/services/intervention.service';
import { useCity } from '@/contexts/city-context';

export function useInterventions(enablePolling = false) {
  const queryClient = useQueryClient();
  const { selectedCity, isLoadingCities } = useCity();

  const interventionsQuery = useQuery({
    queryKey: ['interventions', selectedCity],
    queryFn: () => interventionService.getAll(selectedCity),
    refetchInterval: enablePolling ? 30000 : false,
    enabled: !!selectedCity && !isLoadingCities,
  });

  const dashboardMetricsQuery = useQuery({
    queryKey: ['interventions', 'dashboard', selectedCity],
    queryFn: () => interventionService.getDashboard(selectedCity),
    refetchInterval: enablePolling ? 30000 : false,
    enabled: !!selectedCity && !isLoadingCities,
  });

  const generateMutation = useMutation({
    mutationFn: () => interventionService.generate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
      queryClient.invalidateQueries({ queryKey: ['interventions', 'dashboard'] });
    },
  });

  return {
    interventions: interventionsQuery.data,
    isLoading: interventionsQuery.isLoading,
    isError: interventionsQuery.isError,
    error: interventionsQuery.error,
    refetch: interventionsQuery.refetch,
    
    dashboardMetrics: dashboardMetricsQuery.data,
    isLoadingMetrics: dashboardMetricsQuery.isLoading,

    generateInterventions: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
  };
}
export default useInterventions;
