"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { CityProvider } from '@/contexts/city-context';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchInterval: 30000, // 30 seconds auto refresh
        staleTime: 10000,
        refetchOnWindowFocus: true,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <CityProvider>
        {children}
      </CityProvider>
    </QueryClientProvider>
  );
}
