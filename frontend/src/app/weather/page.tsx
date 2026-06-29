"use client";

import { useStations } from '@/hooks/useStations';
import { useLatestWeather, useWeatherHistory, useWeatherStatistics } from '@/hooks/useWeather';
import { Thermometer, Droplets, Wind, CloudRain, Gauge, Calendar, Search, Building2, Radio, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function WeatherPage() {
  const { stations } = useStations();
  const { data: statistics, isLoading: isLoadingStats } = useWeatherStatistics();
  const { data: latestWeather, isLoading: isLoadingLatest } = useLatestWeather();

  // Filter States
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedStation, setSelectedStation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Derived filter calculations
  const uniqueCities = Array.from(new Set(stations?.map(s => s.city) || []));
  const filteredStations = stations?.filter(s => !selectedCity || s.city === selectedCity) || [];

  // Determine active station ID for historical chart
  const defaultStation = stations?.[0]?.id || '';
  const activeStationId = selectedStation || defaultStation;

  // Query history for the chart
  const { data: historyRes, isLoading: isLoadingHistory } = useWeatherHistory({
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
      temp: item.temperature,
      humidity: item.humidity,
      wind: item.windSpeed,
      rain: item.rainfall,
    }));

  // Filter live table records based on filters
  const filteredLatest = (latestWeather || []).filter(item => {
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
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Meteorological Intelligence</h1>
          <p className="mt-1 text-sm text-zinc-400">Microclimate tracking, weather records, and atmospheric conditions</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1.5 border border-zinc-800">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-zinc-300">Live Feed</span>
        </div>
      </div>

      {/* Stats Summary Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Average Temp", value: statistics?.averageTemperature ? `${Math.round(statistics.averageTemperature)}°C` : 'N/A', subtitle: "Network ambient reading", icon: Thermometer },
          { title: "Average Humidity", value: statistics?.averageHumidity ? `${Math.round(statistics.averageHumidity)}%` : 'N/A', subtitle: "Atmospheric moisture", icon: Droplets },
          { title: "Average Wind Speed", value: statistics?.averageWindSpeed ? `${Math.round(statistics.averageWindSpeed)} km/h` : 'N/A', subtitle: "Pollutant dispersion factor", icon: Wind },
          { title: "Total Rainfall", value: statistics?.totalRainfall ? `${Math.round(statistics.totalRainfall)} mm` : '0 mm', subtitle: "Cumulative wet deposition", icon: CloudRain }
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
              setSelectedStation(''); // reset station
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
              <h2 className="text-lg font-semibold">Microclimate Trends</h2>
            </div>
            <span className="text-xs text-zinc-500">Showing last 100 meteorological measurements</span>
          </div>

          {isLoadingHistory ? (
            <div className="h-[350px] flex items-center justify-center text-zinc-500">
              Fetching weather timeline...
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[350px] flex items-center justify-center text-zinc-500">
              No weather data matches criteria.
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
                  <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} name="Temp (°C)" dot={false} />
                  <Line yAxisId="left" type="monotone" dataKey="humidity" stroke="#10b981" strokeWidth={1.5} name="Humidity (%)" dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="wind" stroke="#60a5fa" strokeWidth={1.5} name="Wind Speed (km/h)" dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="rain" stroke="#8b5cf6" strokeWidth={2} name="Rainfall (mm)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Live Weather Sidebar */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col h-[464px]">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Station Summary</h2>
            <p className="text-xs text-zinc-400">Current meteorology feeds</p>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {isLoadingLatest ? (
              <div className="text-zinc-500 animate-pulse text-sm">Loading weather data...</div>
            ) : filteredLatest.length === 0 ? (
              <div className="text-zinc-500 text-sm">No active weather stations match.</div>
            ) : (
              filteredLatest.map((item, index) => {
                const weather = item.latestWeather;
                const stationDetails = stations?.find(s => s.id === item.station.id);
                return (
                  <div key={index} className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 flex items-center justify-between hover:border-zinc-700 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">{item.station.name}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{item.station.code} • {stationDetails?.city || ''}</p>
                    </div>
                    {weather ? (
                      <div className="text-right">
                        <span className="text-lg font-bold text-zinc-200">{Math.round(weather.temperature)}°C</span>
                        <span className="block text-[9px] font-semibold text-zinc-400 mt-1">
                          {weather.humidity}% RH | {weather.windSpeed} km/h
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

      {/* Weather Readings Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-100">Detailed Weather Observations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400 border-collapse">
            <thead className="bg-zinc-950/40 text-xs font-semibold text-zinc-300 uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Station</th>
                <th className="px-6 py-4">Temperature</th>
                <th className="px-6 py-4">Humidity</th>
                <th className="px-6 py-4">Wind Speed</th>
                <th className="px-6 py-4">Wind Dir</th>
                <th className="px-6 py-4">Pressure</th>
                <th className="px-6 py-4">Rainfall</th>
                <th className="px-6 py-4">Observed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoadingLatest ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-zinc-500">Loading measurements...</td>
                </tr>
              ) : filteredLatest.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-zinc-500">No active observations match current filters.</td>
                </tr>
              ) : (
                filteredLatest.map((item, index) => {
                  const weather = item.latestWeather;
                  const stationDetails = stations?.find(s => s.id === item.station.id);
                  return (
                    <tr key={index} className="hover:bg-zinc-850/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-zinc-200 block">{item.station.name}</span>
                        <span className="text-xs text-zinc-500">{item.station.code} • {stationDetails?.city || ''}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-200">
                        {weather ? `${weather.temperature.toFixed(1)}°C` : '-'}
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-200">
                        {weather ? `${weather.humidity}%` : '-'}
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-200">
                        {weather ? `${weather.windSpeed.toFixed(1)} km/h` : '-'}
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-200">
                        {weather ? `${weather.windDirection}°` : '-'}
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-200">
                        {weather ? `${weather.pressure} hPa` : '-'}
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-200">
                        {weather ? `${weather.rainfall.toFixed(1)} mm` : '-'}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500">
                        {weather?.timestamp ? format(new Date(weather.timestamp), 'PPpp') : 'N/A'}
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
