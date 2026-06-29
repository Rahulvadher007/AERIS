"use client";

import { useStations } from '@/hooks/useStations';
import { useForecast } from '@/hooks/useForecast';
import { TrendingUp, Activity, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function ForecastPage() {
  const { stations } = useStations();
  const [selectedStation, setSelectedStation] = useState('');

  // Fallback to first station once loaded
  const activeStation = selectedStation || stations?.[0]?.stationCode || 'DEL001';
  const activeStationName = stations?.find(s => s.stationCode === activeStation)?.stationName || activeStation;

  // Fetch forecast for selected station (60s polling)
  const { forecast24h, forecast48h, forecast72h, isLoading, isError } = useForecast(activeStation, true);

  const chartData = [
    { name: 'Current', aqi: forecast24h?.currentAQI || 0 },
    { name: '+24h', aqi: forecast24h?.forecastAQI || 0 },
    { name: '+48h', aqi: forecast48h?.forecastAQI || 0 },
    { name: '+72h', aqi: forecast72h?.forecastAQI || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Predictive Forecasting</h1>
          <p className="mt-1 text-sm text-zinc-400">Horizon Projections from XGBoost Models</p>
        </div>
        
        {/* Station Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-400">Monitoring Station:</span>
          <select
            value={activeStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
          >
            {stations?.map((station) => (
              <option key={station.id} value={station.stationCode}>
                {station.stationName} ({station.stationCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "24-Hour Forecast", data: forecast24h },
          { title: "48-Hour Forecast", data: forecast48h },
          { title: "72-Hour Forecast", data: forecast72h }
        ].map((item, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-400">{item.title}</h3>
              {isLoading ? (
                <p className="mt-4 text-zinc-500 animate-pulse">Running model inference...</p>
              ) : item.data ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Predicted AQI</span>
                    <p className="text-4xl font-bold tracking-tight text-red-500 mt-1">{item.data.forecastAQI}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800/60 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Category</span>
                      <span className="font-semibold text-zinc-300 block mt-0.5">{item.data.category}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Risk Level</span>
                      <span className={cn(
                        "font-semibold block mt-0.5 uppercase",
                        ['EMERGENCY', 'SEVERE', 'HIGH'].includes(item.data.riskLevel) ? "text-red-400" : "text-emerald-400"
                      )}>{item.data.riskLevel}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-zinc-500 text-sm">No forecast data available.</p>
              )}
            </div>
            
            {!isLoading && item.data && (
              <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  {(item.data.confidence * 100).toFixed(0)}% Confidence
                </span>
                <span>v1.0 model</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-2 text-zinc-100 mb-6">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-semibold">Forecast Horizon Trend (Station: {activeStationName})</h2>
        </div>
        
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center text-zinc-500">
            Generating chart dataset...
          </div>
        ) : isError ? (
          <div className="h-[400px] flex items-center justify-center text-red-400">
            Failed to render trend chart.
          </div>
        ) : (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                <XAxis dataKey="name" stroke="#a1a1aa" tick={{ fill: '#a1a1aa' }} />
                <YAxis stroke="#a1a1aa" tick={{ fill: '#a1a1aa' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#ef4444' }}
                />
                <ReferenceLine y={150} label={{ position: 'top', value: 'Poor Limit', fill: '#f97316' }} stroke="#f97316" strokeDasharray="3 3" />
                <ReferenceLine y={250} label={{ position: 'top', value: 'Severe Limit', fill: '#ef4444' }} stroke="#ef4444" strokeDasharray="3 3" />
                <Line 
                  type="monotone" 
                  dataKey="aqi" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ r: 6, fill: '#ef4444', strokeWidth: 2, stroke: '#18181b' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
