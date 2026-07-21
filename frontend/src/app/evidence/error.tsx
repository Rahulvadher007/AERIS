'use client';
import { PageErrorBoundary } from '@/components/PageErrorBoundary.client';
export default function EvidenceError({ error, reset }: { error: Error; reset: () => void }) {
  return <PageErrorBoundary error={error} reset={reset} title="Evidence Data Unavailable" />;
}
