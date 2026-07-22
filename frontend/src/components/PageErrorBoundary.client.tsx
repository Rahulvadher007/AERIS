'use client';

interface PageErrorBoundaryProps {
  error: Error;
  reset: () => void;
  title?: string;
}

export function PageErrorBoundary({ error, reset, title = 'Failed to load' }: PageErrorBoundaryProps) {
  return (
    <div className="flex h-[50vh] items-center justify-center text-zinc-400">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-red-500/10 p-4 border border-red-500/20">
          <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-zinc-200">{title}</h2>
        <p className="text-sm text-zinc-500 max-w-md">{error.message || 'An unexpected error occurred'}</p>
        <button
          onClick={reset}
          className="rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-6 py-2 text-sm font-semibold transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
