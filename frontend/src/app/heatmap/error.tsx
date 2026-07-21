'use client';
import { PageErrorBoundary } from '@/components/PageErrorBoundary.client';
export default function HeatmapError({ error, reset }: { error: Error; reset: () => void }) {
  return <PageErrorBoundary error={error} reset={reset} title="Heatmap Unavailable" />;
}
