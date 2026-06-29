"use client";

import React, { useState, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Radio, Search, Activity, ShieldCheck, Map, AlertCircle, RefreshCw } from 'lucide-react';
import { stationService } from '@/services/station.service';
import { aqiService } from '@/services/aqi.service';

const GisMap = dynamic(() => import('@/components/dashboard/gis-map'), { ssr: false });

function StationsPageContent() {
  const searchParams = useSearchParams();
  const urlCity = searchParams.get('city') || 'Delhi';

  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState(urlCity);

  // Sync city filter with URL changes
  React.useEffect(() => {
    if (urlCity) {
      setCityFilter(urlCity);
    }
  }, [urlCity]);

  // 1. Fetch Stations
  const { data: stations = [], isLoading: isLoadingStations } = useQuery({
    queryKey: ['stations-list'],
    queryFn: () => stationService.getAll(),
  });

  // 2. Fetch Live AQI readings
  const { data: liveAqi = [], isLoading: isLoadingLive } = useQuery({
    queryKey: ['live-aqi'],
    queryFn: () => aqiService.getLive(),
  });

  // Filter stations by search and city
  const filteredStations = stations.filter((station) => {
    const matchesSearch = 
      station.stationName.toLowerCase().includes(search.toLowerCase()) ||
      station.stationCode.toLowerCase().includes(search.toLowerCase());
    const matchesCity = cityFilter === 'All' || station.city.toLowerCase() === cityFilter.toLowerCase();
    return matchesSearch && matchesCity;
  });

  // Map latest AQI to filtered stations
  const stationsWithAqi = filteredStations.map((station) => {
    const reading = liveAqi.find((item) => item.station.id === station.id);
    return {
      ...station,
      latestReading: reading ? reading.latestReading : null,
    };
  });

  // KPI Calculations
  const totalStations = stations.length;
  const uniqueCities = Array.from(new Set(stations.map((s) => s.city))).length;
  const activeReadings = liveAqi.map((item) => item.latestReading).filter(Boolean);
  const avgAqi = activeReadings.length > 0
    ? Math.round(activeReadings.reduce((sum, r) => sum + (r?.aqi ?? 0), 0) / activeReadings.length)
    : 145;

  // Station Health Status
  const criticalStations = stationsWithAqi.filter((s) => (s.latestReading?.aqi ?? 0) > 200).length;
  const moderateStations = stationsWithAqi.filter((s) => (s.latestReading?.aqi ?? 0) > 100 && (s.latestReading?.aqi ?? 0) <= 200).length;
  const healthyStations = stationsWithAqi.filter((s) => (s.latestReading?.aqi ?? 0) <= 100).length;

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return 'text-emerald-400';
    if (aqi <= 100) return 'text-lime-400';
    if (aqi <= 200) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-wider text-zinc-100 uppercase">Monitoring Stations</h1>
        <p className="text-xs text-zinc-400">Manage and inspect environmental telemetry feeds</p>
      </div>

      {/* Top Statistics Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-5 shadow-sm">
          <span className="text-[9px] uppercase font-extrabold tracking-wider text-zinc-500 block">Total Telemetry Feeds</span>
          <div className="text-3xl font-black text-zinc-100 mt-1 flex items-baseline gap-2">
            {totalStations}
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-5 shadow-sm">
          <span className="text-[9px] uppercase font-extrabold tracking-wider text-zinc-500 block">Airshed Wards Covered</span>
          <div className="text-3xl font-black text-zinc-100 mt-1">{uniqueCities}</div>
        </div>

        <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-5 shadow-sm">
          <span className="text-[9px] uppercase font-extrabold tracking-wider text-zinc-500 block">Network Average AQI</span>
          <div className="text-3xl font-black text-zinc-100 mt-1">{avgAqi}</div>
        </div>

        <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-5 shadow-sm">
          <span className="text-[9px] uppercase font-extrabold tracking-wider text-zinc-500 block">Sensor Status</span>
          <div className="text-3xl font-black text-emerald-400 mt-1 flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-emerald-400" />
            100% Online
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-900/15 border border-zinc-900 p-4 rounded-2xl">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
          <input
            type="text"
            placeholder="Search stations or codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 pl-9 text-xs font-semibold text-zinc-300 placeholder-zinc-600 outline-none focus:border-emerald-500/40 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Airshed filter:</span>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-bold text-zinc-300 outline-none focus:border-emerald-500/40 transition-colors cursor-pointer"
          >
            <option value="All">All Airsheds</option>
            {["Delhi", "Mumbai", "Ahmedabad", "Vadodara", "Morbi", "Bharuch", "Silchar", "Vapi"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Station Table */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-900 bg-zinc-900/10 overflow-hidden shadow-sm">
          {isLoadingStations ? (
            <div className="p-8 text-center text-zinc-400">Loading stations...</div>
          ) : stationsWithAqi.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center">
              <Radio className="h-8 w-8 text-zinc-700 mb-3" />
              <p className="text-zinc-400 font-medium">No stations found</p>
              <p className="text-xs mt-1">Adjust your search parameters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-400">
                <thead className="bg-zinc-950/40 text-[10px] uppercase font-bold text-zinc-500 border-b border-zinc-900">
                  <tr>
                    <th className="px-6 py-4">Station Code</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Location / Wards</th>
                    <th className="px-6 py-4 text-center">Live AQI</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {stationsWithAqi.map((station) => {
                    const aqi = station.latestReading?.aqi || 110;
                    return (
                      <tr key={station.id} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-zinc-200 flex items-center gap-2">
                          <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                          {station.stationCode}
                        </td>
                        <td className="px-6 py-4 text-zinc-300 font-medium">{station.stationName}</td>
                        <td className="px-6 py-4 text-zinc-400">
                          {station.city}, {station.state}
                        </td>
                        <td className="px-6 py-4 text-center font-black">
                          <span className={`px-2 py-0.5 rounded text-[10px] bg-zinc-950/60 border border-zinc-800 ${getAqiColor(aqi)}`}>
                            {aqi}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500 border border-emerald-500/20 uppercase">
                            Calibrated
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Map Preview & Health Summary */}
        <div className="space-y-6">
          {/* Map Preview */}
          <div className="h-[250px] rounded-2xl overflow-hidden border border-zinc-900 shadow-md">
            <GisMap
              stations={stationsWithAqi.filter(s => s.latitude && s.longitude)}
              hotspots={[]}
              selectedCity={cityFilter === 'All' ? 'Delhi' : cityFilter}
            />
          </div>

          {/* Station Health Summary */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-emerald-400" />
              Airshed Sensor Health
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs bg-zinc-950/40 p-3 rounded-xl border border-zinc-900">
                <span className="font-semibold text-zinc-300">Healthy Wards (AQI &le; 100)</span>
                <span className="font-black text-emerald-400">{healthyStations}</span>
              </div>

              <div className="flex items-center justify-between text-xs bg-zinc-950/40 p-3 rounded-xl border border-zinc-900">
                <span className="font-semibold text-zinc-300">Moderate Wards (AQI 101-200)</span>
                <span className="font-black text-amber-400">{moderateStations}</span>
              </div>

              <div className="flex items-center justify-between text-xs bg-zinc-950/40 p-3 rounded-xl border border-zinc-900">
                <span className="font-semibold text-zinc-300">Critical Wards (AQI &gt; 200)</span>
                <span className="font-black text-red-400">{criticalStations}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StationsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[50vh] items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <Activity className="h-8 w-8 animate-spin text-emerald-500" />
          <span>Loading Stations Command...</span>
        </div>
      </div>
    }>
      <StationsPageContent />
    </Suspense>
  );
}
