"use client";

import { useInterventions } from '@/hooks/useInterventions';
import { 
  Activity, 
  Zap, 
  ShieldAlert, 
  ArrowDownToLine, 
  RefreshCw, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Percent, 
  TrendingUp 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function InterventionsPage() {
  const { 
    interventions, 
    isLoading, 
    isGenerating, 
    generateInterventions 
  } = useInterventions(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Intervention Plans</h1>
          <p className="mt-1 text-zinc-400">Decision Support System & Impact Simulation</p>
        </div>
        <button 
          onClick={() => generateInterventions()}
          disabled={isGenerating}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
        >
          <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
          {isGenerating ? "Simulating Impacts..." : "Run Global Analysis Sweep"}
        </button>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <div className="p-8 text-center text-zinc-400">Loading Intelligence...</div>
        ) : interventions?.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center bg-zinc-950/20">
            <Activity className="mx-auto h-8 w-8 text-zinc-600 animate-pulse" />
            <h3 className="mt-4 text-lg font-medium text-zinc-200">No active interventions</h3>
            <p className="mt-2 text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
              The city's air quality is currently stable, or no interventions have been generated. Run a global analysis sweep to check all zones.
            </p>
          </div>
        ) : (
          interventions?.map((plan: any) => (
            <div key={plan.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden hover:border-zinc-700/80 transition-all duration-300 shadow-lg">
              {/* Card Header */}
              <div className="border-b border-zinc-800 p-6 bg-zinc-900/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    <span className="font-semibold text-zinc-200">{plan.zone?.zoneName || "Unknown Zone"}</span>
                    <span className="text-zinc-600">•</span>
                    <span>{plan.zone?.city || "Unknown City"}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                      plan.priority === 'CRITICAL' && "bg-red-500/10 text-red-400 border-red-500/20",
                      plan.priority === 'HIGH' && "bg-orange-500/10 text-orange-400 border-orange-500/20",
                      plan.priority === 'MEDIUM' && "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                      plan.priority === 'LOW' && "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                    )}>
                      {plan.priority} Priority
                    </span>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                      ['EMERGENCY', 'SEVERE'].includes(plan.riskLevel) && "bg-red-500/10 text-red-400 border-red-500/20",
                      plan.riskLevel === 'HIGH' && "bg-orange-500/10 text-orange-400 border-orange-500/20",
                      plan.riskLevel === 'MODERATE' && "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                      plan.riskLevel === 'LOW' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    )}>
                      {plan.riskLevel} Risk
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h2 className="text-xl font-bold text-zinc-100 tracking-tight">{plan.title}</h2>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{plan.description}</p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-950/40 border-b border-zinc-800">
                <div className="rounded-lg bg-zinc-950/80 p-3 border border-zinc-900">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Current AQI</p>
                  <p className="text-xl font-bold text-zinc-200 mt-1">{plan.currentAQI}</p>
                </div>
                <div className="rounded-lg bg-zinc-950/80 p-3 border border-zinc-900">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    Forecast AQI <TrendingUp className="h-3 w-3 text-red-400" />
                  </p>
                  <p className="text-xl font-bold text-zinc-200 mt-1">{plan.forecastAQI}</p>
                </div>
                <div className="rounded-lg bg-zinc-950/80 p-3 border border-zinc-900">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Expected Reduction</p>
                  <p className="text-xl font-bold text-emerald-500 mt-1">-{plan.estimatedAQIReduction}</p>
                </div>
                <div className="rounded-lg bg-zinc-950/80 p-3 border border-zinc-900">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    Simulated AQI <ArrowDownToLine className="h-3 w-3 text-emerald-500" />
                  </p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">{plan.postInterventionAQI}</p>
                </div>
              </div>

              {/* Factors & Confidence Footer Row */}
              <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-zinc-950/20 border-b border-zinc-800">
                {/* Contributing Factors */}
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Contributing Factors</span>
                  <div className="flex flex-wrap gap-2">
                    {plan.contributingFactors?.map((factor: string, i: number) => (
                      <span key={i} className="inline-flex items-center rounded-md bg-zinc-800/80 px-2.5 py-1 text-xs text-zinc-300 border border-zinc-700/50">
                        {factor}
                      </span>
                    )) || <span className="text-xs text-zinc-500">None detected</span>}
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="min-w-[180px] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-medium">Confidence Score</span>
                    <span className="text-emerald-400 font-bold">{Math.round(plan.confidenceScore * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-980 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${plan.confidenceScore * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Recommended Direct Actions */}
              <div className="p-6 bg-zinc-950/60">
                <h4 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-500 fill-emerald-500/10" />
                  Recommended Direct Actions
                </h4>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {plan.recommendedActions.map((action: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-300 bg-zinc-905/30 p-3 rounded-lg border border-zinc-800/40">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-semibold text-xs">
                        <span>{i + 1}</span>
                      </div>
                      <span className="leading-relaxed">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Last Updated Timestamp */}
              <div className="px-6 py-3 bg-zinc-950/80 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-zinc-600" />
                  Last Updated: {plan.createdAt ? format(new Date(plan.createdAt), 'PPpp') : 'N/A'}
                </span>
                <span className="font-mono text-zinc-600 text-[9px]">ID: {plan.id.slice(0, 8)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
