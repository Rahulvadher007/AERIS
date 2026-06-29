"use client";

import { useStations } from '@/hooks/useStations';
import { useLiveAqi, useAqiHistory, useAqiStatistics } from '@/hooks/useAQI';
import { Activity, TrendingUp, Calendar, Filter, Search, Building2, Radio } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

function getAqiStatus(aqi: number) {
  if (aqi <= 50) return { label: 'Good', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
  if (aqi <= 150) return { label: 'Poor', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' };
  if (aqi <= 200) return { label: 'Unhealthy', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
  return { label: 'Severe', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
}

export default function AqiPage() {
  const { stations } = useStations();
  const { data: statistics, isLoading: isLoadingStats } = useAqiStatistics();
  const { data: liveAqi, isLoading: isLoadingLive } = useLiveAqi(true);

  // Filter States
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedStation, setSelectedStation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Derived filters
  const uniqueCities = Array.from(new Set(stations?.map(s => s.city) || []));
  const filteredStations = stations?.filter(s => !selectedCity || s.city === selectedCity) || [];

  // Determine active station ID for historical chart
  const defaultStation = stations?.[0]?.id || '';
  const activeStationId = selectedStation || defaultStation;

  // Query history for the chart
  const { data: historyRes, isLoading: isLoadingHistory } = useAqiHistory({
    stationId: activeStationId || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    limit: 100
  });

  // Prepare chart data
  const chartData = (historyRes?.data || [])
    .slice()
    .reverse()
    .map(item => ({
      name: format(new Date(item.timestamp), 'MM-dd HH:mm'),
      aqi: item.aqi,
      pm25: item.pm25 || 0,
      pm10: item.pm10 || 0,
    }));

  // Filter live table records based on filters
  const filteredLive = (liveAqi || []).filter(item => {
    const station = item.station;
    const stationDetails = stations?.find(s => s.id === station.id);
    const matchesCity = !selectedCity || stationDetails?.city === selectedCity;
    const matchesStation = !selectedStation || station.id === selectedStation;
    const matchesSearch = !searchQuery || 
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      station.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesStation && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">AQI Analytics</h1>
          <p className="mt-1 text-sm text-zinc-400">Live monitoring, historical parameters, and station analysis</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1.5 border border-zinc-800">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-zinc-300">Live Updating</span>
        </div>
      </div>

      {/* Stats Summary Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Average AQI", value: statistics?.averageAQI ? Math.round(statistics.averageAQI) : 'N/A', subtitle: "Across all stations", icon: Activity },
          { title: "Maximum AQI", value: statistics?.maximumAQI ?? 'N/A', subtitle: "Peak pollution index", icon: TrendingUp },
          { title: "Total Stations", value: statistics?.totalStations ?? 'N/A', subtitle: "Active nodes in network", icon: Radio },
          { title: "Total Readings", value: statistics?.totalReadings ?? 'N/A', subtitle: "Database measurements", icon: Building2 }
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
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 grid gap-4 sm:grid-cols-2 md:grid-cols-5 items-end">
        {/* City Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" /> City
          </label>
          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setSelectedStation(''); // reset station on city change
            }}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Cities</option>
            {uniqueCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Station Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5" /> Station
          </label>
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Stations</option>
            {filteredStations.map(station => (
              <option key={station.id} value={station.id}>
                {station.stationName} ({station.stationCode})
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
            <Search className="h-3.5 w-3.5" /> Search
          </label>
          <input
            type="text"
            placeholder="Search stations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Charts & Table Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Historical Chart */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-zinc-100">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-semibold">Historical AQI Trend</h2>
            </div>
            <span className="text-xs text-zinc-500">Showing last 100 readings</span>
          </div>

          {isLoadingHistory ? (
            <div className="h-[350px] flex items-center justify-center text-zinc-500">
              Fetching history timeline...
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[350px] flex items-center justify-center text-zinc-500">
              No historical data match the criteria.
            </div>
          ) : (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 10 }} />
                  <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                  />
                  <ReferenceLine y={100} label={{ position: 'top', value: 'Moderate Limit', fill: '#fbbf24', fontSize: 10 }} stroke="#fbbf24" strokeDasharray="3 3" />
                  <ReferenceLine y={150} label={{ position: 'top', value: 'Poor Limit', fill: '#f97316', fontSize: 10 }} stroke="#f97316" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="aqi" stroke="#ef4444" strokeWidth={2.5} dot={false} name="AQI" />
                  <Line type="monotone" dataKey="pm25" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="PM2.5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Live Stations Sidebar */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col h-[464px]">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Live Stations</h2>
            <p className="text-xs text-zinc-400">Current live feeds</p>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {isLoadingLive ? (
              <div className="text-zinc-500 animate-pulse text-sm">Loading live data...</div>
            ) : filteredLive.length === 0 ? (
              <div className="text-zinc-500 text-sm">No active stations match.</div>
            ) : (
              filteredLive.map((item, index) => {
                const reading = item.latestReading;
                const status = reading ? getAqiStatus(reading.aqi) : null;
                const stationDetails = stations?.find(s => s.id === item.station.id);
                return (
                  <div key={index} className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 flex items-center justify-between hover:border-zinc-700 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">{item.station.name}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{item.station.code} • {stationDetails?.city || ''}</p>
                    </div>
                    {reading ? (
                      <div className="text-right">
                        <span className="text-lg font-bold text-zinc-200">{reading.aqi}</span>
                        <span className={cn(
                          "block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border mt-1",
                          status?.color
                        )}>
                          {status?.label}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-600">Offline</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Full Live Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-100">Detailed Live Measurements</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400 border-collapse">
            <thead className="bg-zinc-950/40 text-xs font-semibold text-zinc-300 uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Station</th>
                <th className="px-6 py-4">AQI</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">PM2.5 (µg/m³)</th>
                <th className="px-6 py-4">PM10 (µg/m³)</th>
                <th className="px-6 py-4">NO2 (ppb)</th>
                <th className="px-6 py-4">CO (ppm)</th>
                <th className="px-6 py-4">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoadingLive ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-zinc-500">Loading measurements...</td>
                </tr>
              ) : filteredLive.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-zinc-500">No active readings matches current filters.</td>
                </tr>
              ) : (
                filteredLive.map((item, index) => {
                  const reading = item.latestReading;
                  const status = reading ? getAqiStatus(reading.aqi) : null;
                  const stationDetails = stations?.find(s => s.id === item.station.id);
                  return (
                    <tr key={index} className="hover:bg-zinc-850/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-zinc-200 block">{item.station.name}</span>
                        <span className="text-xs text-zinc-500">{item.station.code} • {stationDetails?.city || ''}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-bold text-zinc-100">{reading?.aqi ?? 'N/A'}</span>
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
                          <span className="text-zinc-600 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono">{reading?.pm25 ?? '-'}</td>
                      <td className="px-6 py-4 font-mono">{reading?.pm10 ?? '-'}</td>
                      <td className="px-6 py-4 font-mono">{reading?.no2 ?? '-'}</td>
                      <td className="px-6 py-4 font-mono">{reading?.co ?? '-'}</td>
                      <td className="px-6 py-4 text-xs text-zinc-500">
                        {reading?.timestamp ? format(new Date(reading.timestamp), 'PPpp') : 'N/A'}
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
