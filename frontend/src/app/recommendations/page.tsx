"use client";

import { useRecommendations } from '@/hooks/useRecommendations';
import { Lightbulb, Info, CheckCircle2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RecommendationsPage() {
  // Fetch recommendations with 60s polling
  const { data: recommendations, isLoading } = useRecommendations(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">AI Recommendations</h1>
          <p className="mt-1 text-sm text-zinc-400">Actionable guidance for pollution control</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-zinc-400 animate-pulse">Loading intelligence...</div>
        ) : !recommendations || recommendations.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-zinc-800 p-12 text-center bg-zinc-950/20">
            <Lightbulb className="mx-auto h-8 w-8 text-zinc-600" />
            <h3 className="mt-4 text-lg font-medium text-zinc-200">No active recommendations</h3>
            <p className="mt-2 text-sm text-zinc-500">All wards report AQI within normal parameters.</p>
          </div>
        ) : (
          recommendations.map((rec: any, idx: number) => (
            <div key={idx} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors shadow-md">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {rec.zone} ({rec.city})
                  </div>
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                    rec.priority === 'HIGH' && "bg-orange-500/10 text-orange-400 border-orange-500/20",
                    rec.priority === 'MEDIUM' && "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                    rec.priority === 'LOW' && "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                  )}>
                    {rec.priority} Priority
                  </span>
                </div>

                {/* Direct Actions */}
                <h3 className="text-sm font-bold text-zinc-200">Recommended Actions</h3>
                <ul className="mt-2 space-y-2">
                  {rec.actions.map((action: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {action}
                    </li>
                  ))}
                </ul>

                {/* Reason block */}
                <div className="mt-4 rounded-lg bg-zinc-950 p-3.5 border border-zinc-800/80">
                  <div className="flex gap-2">
                    <Info className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      <span className="font-semibold text-zinc-300 block mb-0.5">Reason:</span>
                      {rec.reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Metrics */}
              <div className="mt-6 pt-4 border-t border-zinc-800/60 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold flex items-center justify-center gap-0.5">
                    Forecast <TrendingUp className="h-3 w-3 text-zinc-500" />
                  </span>
                  <span className="font-semibold text-zinc-300 mt-1 block">{rec.forecastAQI} AQI</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Expected Red.</span>
                  <span className="font-bold text-emerald-400 mt-1 block">-{rec.expectedReduction}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Confidence</span>
                  <span className="font-semibold text-zinc-300 mt-1 block">{(rec.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
