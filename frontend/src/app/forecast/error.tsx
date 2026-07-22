'use client';
import { PageErrorBoundary } from '@/components/PageErrorBoundary.client';
export default function ForecastError({ error, reset }: { error: Error; reset: () => void }) {
  return <PageErrorBoundary error={error} reset={reset} title="Forecast Data Unavailable" />;
}
