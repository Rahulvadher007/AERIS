"use client";

import { useHotspots } from '@/hooks/useHotspots';
import { AlertTriangle, Flame } from 'lucide-react';

export default function HotspotsPage() {
  // Fetch hotspots with 30s polling
  const { data: hotspots, isLoading } = useHotspots(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Live Hotspots</h1>
          <p className="mt-1 text-sm text-zinc-400">Localized Pollution Anomalies</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-zinc-400 animate-pulse">Scanning for hotspots...</div>
        ) : hotspots?.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-zinc-800 p-12 text-center bg-zinc-950/20">
            <Flame className="mx-auto h-8 w-8 text-zinc-600" />
            <h3 className="mt-4 text-lg font-medium text-zinc-200">No active hotspots</h3>
            <p className="mt-2 text-sm text-zinc-500">Air quality is stable across all zones.</p>
          </div>
        ) : hotspots?.map((spot: any) => (
          <div key={spot.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100">{spot.zone?.zoneName || "General Area"}</h3>
                  <p className="text-sm text-zinc-500">Radius: {spot.radius.toFixed(2)} km</p>
                </div>
              </div>
              <span className="inline-flex rounded-full bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-500 border border-red-500/20">
                AQI: {Math.round(spot.aqi)}
              </span>
            </div>
            
            <div className="mt-6 flex justify-between border-t border-zinc-800 pt-4 text-sm">
              <span className="text-zinc-500">Affected Stations</span>
              <span className="font-medium text-zinc-300">{spot.stationCount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
