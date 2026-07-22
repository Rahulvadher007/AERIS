'use client';
import { PageErrorBoundary } from '@/components/PageErrorBoundary.client';
export default function RecommendationsError({ error, reset }: { error: Error; reset: () => void }) {
  return <PageErrorBoundary error={error} reset={reset} title="Recommendations Unavailable" />;
}
