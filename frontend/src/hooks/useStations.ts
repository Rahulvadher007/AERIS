import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stationService } from '@/services/station.service';
import { Station } from '@/types/station';
import { useCity } from '@/contexts/city-context';

export function useStations() {
  const queryClient = useQueryClient();
  const { selectedCity, isLoadingCities } = useCity();

  const stationsQuery = useQuery({
    queryKey: ['stations', selectedCity],
    queryFn: () => stationService.getAll(selectedCity),
    enabled: !!selectedCity && !isLoadingCities,
  });

  const createStationMutation = useMutation({
    mutationFn: (data: Omit<Station, 'id' | 'createdAt' | 'updatedAt'>) => stationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] });
    },
  });

  const updateStationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Station, 'id' | 'createdAt' | 'updatedAt'>> }) =>
      stationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] });
    },
  });

  const deleteStationMutation = useMutation({
    mutationFn: (id: string) => stationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] });
    },
  });

  return {
    stations: stationsQuery.data,
    isLoading: stationsQuery.isLoading,
    isError: stationsQuery.isError,
    error: stationsQuery.error,
    refetch: stationsQuery.refetch,
    createStation: createStationMutation.mutateAsync,
    isCreating: createStationMutation.isPending,
    updateStation: updateStationMutation.mutateAsync,
    isUpdating: updateStationMutation.isPending,
    deleteStation: deleteStationMutation.mutateAsync,
    isDeleting: deleteStationMutation.isPending,
  };
}
