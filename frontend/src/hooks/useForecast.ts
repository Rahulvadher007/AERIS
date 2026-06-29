import { useQuery } from '@tanstack/react-query';
import { forecastService } from '@/services/forecast.service';

export function useForecast(stationCode: string, enablePolling = false) {
  const refetchInterval = enablePolling ? 60000 : false;

  const query24h = useQuery({
    queryKey: ['forecast', '24h', stationCode],
    queryFn: () => forecastService.get24h(stationCode),
    enabled: !!stationCode,
    refetchInterval,
  });

  const query48h = useQuery({
    queryKey: ['forecast', '48h', stationCode],
    queryFn: () => forecastService.get48h(stationCode),
    enabled: !!stationCode,
    refetchInterval,
  });

  const query72h = useQuery({
    queryKey: ['forecast', '72h', stationCode],
    queryFn: () => forecastService.get72h(stationCode),
    enabled: !!stationCode,
    refetchInterval,
  });

  return {
    forecast24h: query24h.data,
    forecast48h: query48h.data,
    forecast72h: query72h.data,
    isLoading: query24h.isLoading || query48h.isLoading || query72h.isLoading,
    isError: query24h.isError || query48h.isError || query72h.isError,
    error: query24h.error || query48h.error || query72h.error,
    refetch: () => {
      query24h.refetch();
      query48h.refetch();
      query72h.refetch();
    },
  };
}
