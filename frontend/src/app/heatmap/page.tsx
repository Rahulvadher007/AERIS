"use client";

import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/api';

// Dynamic import to prevent SSR (Server-Side Rendering) window errors with Leaflet
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-zinc-400 bg-zinc-950/20">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <span className="text-sm">Initializing spatial map canvas...</span>
      </div>
    </div>
  )
});

export default function HeatmapPage() {
  const { data: heatmapData, isLoading: isLoadingHeatmap } = useQuery({
    queryKey: ['heatmap'],
    queryFn: () => api.get<any>('/gis/heatmap')
  });

  const { data: zones, isLoading: isLoadingZones } = useQuery({
    queryKey: ['zones-geojson'],
    queryFn: () => api.get<any>('/gis/zones-geojson')
  });

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Live Spatial Heatmap</h1>
          <p className="mt-1 text-sm text-zinc-400">Open-source microclimate mapping (No token required)</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 relative">
        <LeafletMap heatmapData={heatmapData} zones={zones} />

        {/* Legend Overlay */}
        <div className="absolute bottom-6 left-6 rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 backdrop-blur-sm z-[1000]">
          <h4 className="text-xs font-semibold uppercase text-zinc-400 mb-3">AQI Severity</h4>
          <div className="flex flex-col gap-2 text-xs text-zinc-300">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" /> Good (0-50)
            </div>
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#eab308]" /> Moderate (51-100)
            </div>
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" /> Poor (101-150)
            </div>
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" /> Unhealthy (151-200)
            </div>
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#a855f7]" /> Severe (201+)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
