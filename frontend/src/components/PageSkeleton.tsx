interface PageSkeletonProps {
  rows?: number;
}

export function PageSkeleton({ rows = 6 }: PageSkeletonProps) {
  return (
    <div className="space-y-4 p-6 animate-pulse">
      <div className="h-8 w-48 bg-zinc-800 rounded-lg" />
      <div className="h-4 w-96 bg-zinc-800/50 rounded-lg" />
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mt-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-zinc-800/30 rounded-xl" />
        ))}
      </div>
      <div className="space-y-3 mt-8">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 bg-zinc-800/20 rounded-lg" style={{ opacity: 1 - i * 0.1 }} />
        ))}
      </div>
    </div>
  );
}
