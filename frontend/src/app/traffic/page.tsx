"use client";

import { useLatestTraffic, useTrafficHistory, useTrafficStatistics, useCongestionHotspots } from '@/hooks/useTraffic';
import { Car, TrendingUp, Calendar, Filter, Search, ShieldAlert, AlertTriangle, CheckCircle2, Navigation } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

function getCongestionStatus(score: number) {
  if (score >= 80) return { label: 'Critical', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
  if (score >= 60) return { label: 'Heavy', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
  if (score >= 40) return { label: 'Moderate', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
  return { label: 'Smooth', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
}

export default function TrafficPage() {
  const { data: latestTraffic, isLoading: isLoadingLatest } = useLatestTraffic();
  const { data: statistics, isLoading: isLoadingStats } = useTrafficStatistics();
  const { data: congestionHotspots, isLoading: isLoadingHotspots } = useCongestionHotspots();

  // Filter States
  const [selectedRoad, setSelectedRoad] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique roads for filter dropdown
  const roadsList = ((latestTraffic || []) as any[]).map(r => ({
    id: r.id,
    name: r.roadName,
    code: r.roadCode
  }));

  // Determine active road ID for historical chart
  const defaultRoadId = (latestTraffic as any)?.[0]?.id || '';
  const activeRoadId = selectedRoad || defaultRoadId;

  // Query history for the chart
  const { data: historyRes, isLoading: isLoadingHistory } = useTrafficHistory({
    roadSegment: activeRoadId || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    limit: 100
  });

  // Prepare chart data (historyRes is an array at runtime)
  const historyData = Array.isArray(historyRes) ? historyRes : (historyRes as any)?.data || [];
  const chartData = historyData
    .slice()
    .reverse()
    .map((item: any) => ({
      name: format(new Date(item.timestamp), 'MM-dd HH:mm'),
      congestion: item.congestionScore,
      speed: item.averageSpeed,
      vehicles: item.vehicleCount,
    }));

  // Filter roads table based on search
  const filteredRoads = ((latestTraffic || []) as any[]).filter(item => {
    const matchesRoad = !selectedRoad || item.id === selectedRoad;
    const matchesSearch = !searchQuery || 
      item.roadName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.roadCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRoad && matchesSearch;
  });

  // Hotspots Features
  const hotspotFeatures = congestionHotspots?.features || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Traffic Flow Analytics</h1>
          <p className="mt-1 text-sm text-zinc-400">Live congestion indexes, network statistics, and arterial road tracking</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1.5 border border-zinc-800">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-zinc-300">Live Update</span>
        </div>
      </div>

      {/* Stats Summary Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            title: "Average Congestion", 
            value: statistics?.averageCongestion ? `${Math.round(statistics.averageCongestion)}%` : 'N/A', 
            subtitle: "Overall network load", 
            icon: Car 
          },
          { 
            title: "Peak Congestion", 
            value: (statistics as any)?.maxCongestion ?? statistics?.peakCongestion ?? 'N/A', 
            subtitle: "Worst segment load", 
            icon: ShieldAlert 
          },
          { 
            title: "Average Speed", 
            value: statistics?.averageSpeed ? `${Math.round(statistics.averageSpeed)} km/h` : 'N/A', 
            subtitle: "Network average speed", 
            icon: TrendingUp 
          },
          { 
            title: "Monitored Vehicles", 
            value: (statistics as any)?.vehicleCount ?? statistics?.totalVehicles ?? '0', 
            subtitle: "Active fleet count", 
            icon: Navigation 
          }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-sm font-medium">{stat.title}</span>
                <Icon className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold tracking-tight text-zinc-100">{stat.value}</span>
                <span className="text-xs text-zinc-500 block mt-1">{stat.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4 items-end">
        {/* Road Segment Filter */}
        <div className="space-y-1.5 font-medium">
          <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
            <Navigation className="h-3.5 w-3.5" /> Road Segment
          </label>
          <select
            value={selectedRoad}
            onChange={(e) => setSelectedRoad(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Segments</option>
            {roadsList.map(road => (
              <option key={road.id} value={road.id}>
                {road.name} ({road.code})
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* End Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Search */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5" /> Search Road Name
          </label>
          <input
            type="text"
            placeholder="Search road segments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Charts & Hotspot Panel */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Historical Chart */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-zinc-100">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-semibold">Historical Congestion & Speed</h2>
            </div>
            <span className="text-xs text-zinc-500">Timeline for selected segment</span>
          </div>

          {isLoadingHistory ? (
            <div className="h-[350px] flex items-center justify-center text-zinc-500">
              Generating chart datasets...
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[350px] flex items-center justify-center text-zinc-500">
              No historical data match current criteria.
            </div>
          ) : (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 10 }} />
                  <YAxis yAxisId="left" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="congestion" stroke="#ef4444" strokeWidth={2} name="Congestion (%)" dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="speed" stroke="#60a5fa" strokeWidth={1.5} name="Avg Speed (km/h)" dot={false} />
                  <Line yAxisId="left" type="monotone" dataKey="vehicles" stroke="#10b981" strokeWidth={1.5} name="Vehicle Count" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Congestion Hotspots Panel */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col h-[464px]">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-1.5">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Congestion Hotspots
            </h2>
            <p className="text-xs text-zinc-400">Segments with congestion index &ge; 76%</p>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {isLoadingHotspots ? (
              <div className="text-zinc-500 animate-pulse text-sm">Detecting grid bottlenecks...</div>
            ) : hotspotFeatures.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-800 p-8 text-center bg-zinc-950/20">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500/70" />
                <p className="mt-2 text-xs font-semibold text-zinc-300">Smooth Traffic Flow</p>
                <p className="text-[10px] text-zinc-500 mt-1">No bottlenecks detected across the network.</p>
              </div>
            ) : (
              hotspotFeatures.map((f: any, index: number) => {
                const props = f.properties;
                const status = getCongestionStatus(props.congestionScore);
                return (
                  <div key={index} className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 flex items-center justify-between hover:border-zinc-700 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">{props.roadName}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Speed: {Math.round(props.averageSpeed)} km/h</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-zinc-200">{Math.round(props.congestionScore)}%</span>
                      <span className={cn(
                        "block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border mt-1",
                        status.color
                      )}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Detailed Live Roads Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-100">Road Congestion Inventory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400 border-collapse">
            <thead className="bg-zinc-950/40 text-xs font-semibold text-zinc-300 uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Road Segment</th>
                <th className="px-6 py-4">Congestion Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Average Speed</th>
                <th className="px-6 py-4">Vehicle Count</th>
                <th className="px-6 py-4">Measurement Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoadingLatest ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-zinc-500">Loading segments...</td>
                </tr>
              ) : filteredRoads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-zinc-500">No road segments match filters.</td>
                </tr>
              ) : (
                filteredRoads.map((item, index) => {
                  const data = item.latestTraffic;
                  const status = data ? getCongestionStatus(data.congestionScore) : null;
                  return (
                    <tr key={index} className="hover:bg-zinc-850/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-zinc-200 block">{item.roadName}</span>
                        <span className="text-xs text-zinc-500">{item.roadCode}</span>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-zinc-100">
                        {data ? `${Math.round(data.congestionScore)}%` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {status ? (
                          <span className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                            status.color
                          )}>
                            {status.label}
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-xs">Offline</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-200">
                        {data ? `${Math.round(data.averageSpeed)} km/h` : '-'}
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-200">
                        {data ? data.vehicleCount : '-'}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500">
                        {data?.timestamp ? format(new Date(data.timestamp), 'PPpp') : 'N/A'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
