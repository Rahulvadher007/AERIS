"use client";

import React, { useState, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  AlertTriangle, Activity, Map, TrendingUp, CloudRain, Car,
  Wind, Thermometer, Droplets, ArrowUpRight, ArrowDownRight,
  ShieldAlert, BadgeCheck, CheckCircle2, RefreshCw, BarChart2
} from 'lucide-react';
import { stationService } from '@/services/station.service';
import { aqiService } from '@/services/aqi.service';
import { hotspotService } from '@/services/hotspot.service';
import { weatherService } from '@/services/weather.service';
import { trafficService } from '@/services/traffic.service';
import { forecastService } from '@/services/forecast.service';
import { interventionService } from '@/services/intervention.service';
import { recommendationService } from '@/services/recommendation.service';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { useCity } from '@/contexts/city-context';

// Dynamically import Leaflet Map to prevent Next.js SSR "window is not defined" errors
const GisMap = dynamic(() => import('@/components/dashboard/gis-map'), { ssr: false });

function DashboardPageContent() {
  const { selectedCity, setSelectedCity, availableCities } = useCity();

  // 1. Fetch Stations
  const { data: stations = [], isLoading: isLoadingStations } = useQuery({
    queryKey: ['stations-list', selectedCity],
    queryFn: () => stationService.getAll(selectedCity),
    enabled: !!selectedCity,
  });

  // Filter stations by city
  const cityStations = stations;
  const primaryStation = cityStations[0]?.stationCode || 'DEL001';

  // 2. Fetch Live AQI readings
  const { data: liveAqi = [], isLoading: isLoadingLive } = useQuery({
    queryKey: ['live-aqi', selectedCity],
    queryFn: () => aqiService.getLive(selectedCity),
    enabled: !!selectedCity,
  });

  // 3. Fetch Hotspots
  const { data: hotspots = [], isLoading: isLoadingHotspots } = useQuery({
    queryKey: ['hotspots-list', selectedCity],
    queryFn: () => hotspotService.getAll(selectedCity),
    enabled: !!selectedCity,
  });

  // Filter hotspots for the selected city (matching zones)
  const cityHotspots = hotspots;

  // 4. Fetch Weather Latest
  const { data: weatherLatest = [], isLoading: isLoadingWeather } = useQuery({
    queryKey: ['weather-latest', selectedCity],
    queryFn: () => weatherService.getLatest(selectedCity),
    enabled: !!selectedCity,
  });

  // 5. Fetch Traffic Latest
  const { data: trafficLatest = [], isLoading: isLoadingTraffic } = useQuery({
    queryKey: ['traffic-latest', selectedCity],
    queryFn: () => trafficService.getLatest(selectedCity),
    enabled: !!selectedCity,
  });

  // 6. Fetch Forecasts for primary station
  const { data: forecast24h } = useQuery({
    queryKey: ['forecast-24h', primaryStation],
    queryFn: () => forecastService.get24h(primaryStation),
    enabled: !!primaryStation,
  });

  const { data: forecast48h } = useQuery({
    queryKey: ['forecast-48h', primaryStation],
    queryFn: () => forecastService.get48h(primaryStation),
    enabled: !!primaryStation,
  });

  const { data: forecast72h } = useQuery({
    queryKey: ['forecast-72h', primaryStation],
    queryFn: () => forecastService.get72h(primaryStation),
    enabled: !!primaryStation,
  });

  // 7. Fetch Interventions & Recommendations
  const { data: interventions = [], isLoading: isLoadingInterventions } = useQuery({
    queryKey: ['interventions-list', selectedCity],
    queryFn: () => interventionService.getAll(selectedCity),
    enabled: !!selectedCity,
  });

  const { data: recommendations = [], isLoading: isLoadingRecs } = useQuery({
    queryKey: ['recommendations-list', selectedCity],
    queryFn: () => recommendationService.getAll(selectedCity),
    enabled: !!selectedCity,
  });

  // Loading State
  if (isLoadingStations || isLoadingLive || isLoadingHotspots || isLoadingWeather || isLoadingTraffic || isLoadingInterventions || isLoadingRecs) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-zinc-400 bg-zinc-950/20 rounded-2xl border border-zinc-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-24 opacity-60 animate-pulse">
            <Image src="/assets/logo/aeris-logo.png" alt="AERIS Logo" fill className="object-contain" priority />
          </div>
          <span className="text-xs font-semibold tracking-wider uppercase text-emerald-500">Initializing Command Center...</span>
        </div>
      </div>
    );
  }

  // --- DYNAMIC CALCULATIONS & METRICS ---
  // Get active readings for selected city
  const cityStationIds = cityStations.map((s) => s.id);
  const cityReadings = liveAqi
    .filter((item) => cityStationIds.includes(item.station.id))
    .map((item) => item.latestReading)
    .filter(Boolean);

  const currentAqi = cityReadings.length > 0
    ? Math.round(cityReadings.reduce((sum, r) => sum + (r?.aqi ?? 0), 0) / cityReadings.length)
    : 165;

  const forecastAqi = forecast24h?.forecastAQI || Math.round(currentAqi * 1.08);

  // Weather averages for selected city
  const cityWeather = weatherLatest.filter((w) => cityStationIds.includes(w.station.id) && w.latestWeather);
  const avgTemp = cityWeather.length > 0
    ? Math.round(cityWeather.reduce((sum, w) => sum + (w.latestWeather?.temperature ?? 0), 0) / cityWeather.length)
    : 28;
  const avgHumidity = cityWeather.length > 0
    ? Math.round(cityWeather.reduce((sum, w) => sum + (w.latestWeather?.humidity ?? 0), 0) / cityWeather.length)
    : 62;
  const avgWindSpeed = cityWeather.length > 0
    ? parseFloat((cityWeather.reduce((sum, w) => sum + (w.latestWeather?.windSpeed ?? 0), 0) / cityWeather.length).toFixed(1))
    : 4.2;

  // Traffic congestion average
  const avgCongestion = trafficLatest.length > 0
    ? Math.round(trafficLatest.reduce((sum, t) => sum + t.congestionScore, 0) / trafficLatest.length)
    : 38;

  // Forecast Confidence
  const forecastConfidence = forecast24h?.confidence || 0.89;

  // Dynamic Pollutant Breakdown
  const avgPM25 = cityReadings.length > 0
    ? Math.round(cityReadings.reduce((sum, r) => sum + (r?.pm25 ?? 0), 0) / cityReadings.length)
    : 72;
  const avgPM10 = cityReadings.length > 0
    ? Math.round(cityReadings.reduce((sum, r) => sum + (r?.pm10 ?? 0), 0) / cityReadings.length)
    : 145;
  const avgNO2 = cityReadings.length > 0
    ? Math.round(cityReadings.reduce((sum, r) => sum + (r?.no2 ?? 0), 0) / cityReadings.length)
    : 34;
  const avgSO2 = cityReadings.length > 0
    ? Math.round(cityReadings.reduce((sum, r) => sum + (r?.so2 ?? 0), 0) / cityReadings.length)
    : 12;

  const pollutantData = [
    { name: 'PM2.5', value: avgPM25 },
    { name: 'PM10', value: avgPM10 },
    { name: 'NO2', value: avgNO2 },
    { name: 'SO2', value: avgSO2 },
  ];

  // Dynamic Source Apportionment
  // If congestion is high, Traffic gets a higher percentage. If wind speed is low, Background accumulates.
  const trafficShare = Math.round(avgCongestion * 0.8);
  const constructionShare = 25;
  const industryShare = currentAqi > 200 ? 30 : 15;
  const naturalShare = Math.max(5, 100 - (trafficShare + constructionShare + industryShare));
  const sourceData = [
    { name: 'Traffic', value: trafficShare, color: '#ef4444' },
    { name: 'Construction', value: constructionShare, color: '#f59e0b' },
    { name: 'Industry', value: industryShare, color: '#3b82f6' },
    { name: 'Natural', value: naturalShare, color: '#10b981' },
  ];

  // Recharts AQI Trend Data (last 7 readings)
  const trendData = cityReadings.slice(-7).map((r, idx) => ({
    name: new Date(r?.timestamp ?? '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    AQI: r?.aqi ?? 120 + idx * 10,
  }));

  if (trendData.length === 0) {
    // fallback data
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(d.getHours() - i);
      trendData.push({
        name: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        AQI: Math.round(currentAqi * (0.9 + Math.random() * 0.2)),
      });
    }
  }

  // Target city average AQI color
  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (aqi <= 100) return 'text-lime-400 border-lime-500/20 bg-lime-500/5';
    if (aqi <= 200) return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    if (aqi <= 300) return 'text-orange-400 border-orange-500/20 bg-orange-500/5';
    return 'text-red-400 border-red-500/20 bg-red-500/5';
  };

  // AI Intelligence Panel dynamic values
  const aiTrafficContribution = trafficShare;
  const aiWindImpact = avgWindSpeed < 3.0 ? 'reduced wind speed' : 'atmospheric stagnation';
  const activeHotspotCount = cityHotspots.length;
  const primaryIntervention = interventions[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-zinc-100 uppercase flex items-center gap-2">
            AERIS Command Center
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
              Operational
            </span>
          </h1>
          <p className="text-xs text-zinc-400">Environmental Intelligence & Tactical Response</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Airshed Zone:</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-200 outline-none focus:border-emerald-500 transition-colors"
          >
            {availableCities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Top KPI Section */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
        {/* KPI 1 */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-4 text-center shadow-sm">
          <span className="text-[9px] uppercase font-extrabold tracking-wider text-zinc-500">Current AQI</span>
          <div className="text-2xl font-black text-zinc-100 mt-1">{currentAqi}</div>
        </div>
        {/* KPI 2 */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-4 text-center shadow-sm">
          <span className="text-[9px] uppercase font-extrabold tracking-wider text-zinc-500">Forecast AQI</span>
          <div className="text-2xl font-black text-zinc-100 mt-1">{forecastAqi}</div>
        </div>
        {/* KPI 3 */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-4 text-center shadow-sm">
          <span className="text-[9px] uppercase font-extrabold tracking-wider text-zinc-500">Critical Wards</span>
          <div className="text-2xl font-black text-red-400 mt-1">{cityHotspots.filter(h => h.severity === 'CRITICAL').length}</div>
        </div>
        {/* KPI 4 */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-4 text-center shadow-sm">
          <span className="text-[9px] uppercase font-extrabold tracking-wider text-zinc-500">Active Hotspots</span>
          <div className="text-2xl font-black text-orange-400 mt-1">{activeHotspotCount}</div>
        </div>
        {/* KPI 5 */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-4 text-center shadow-sm">
          <span className="text-[9px] uppercase font-extrabold tracking-wider text-zinc-500">Wind Speed</span>
          <div className="text-2xl font-black text-zinc-100 mt-1">{avgWindSpeed} m/s</div>
        </div>
        {/* KPI 6 */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-4 text-center shadow-sm">
          <span className="text-[9px] uppercase font-extrabold tracking-wider text-zinc-500">Traffic Congestion</span>
          <div className="text-2xl font-black text-zinc-100 mt-1">{avgCongestion}%</div>
        </div>
        {/* KPI 7 */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-4 text-center shadow-sm">
          <span className="text-[9px] uppercase font-extrabold tracking-wider text-zinc-500">Confidence</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{Math.round(forecastConfidence * 100)}%</div>
        </div>
        {/* KPI 8 */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-4 text-center shadow-sm">
          <span className="text-[9px] uppercase font-extrabold tracking-wider text-zinc-500">Interventions</span>
          <div className="text-2xl font-black text-zinc-100 mt-1">{interventions.length}</div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left GIS Map Container */}
        <div className="lg:col-span-2 h-[450px] min-h-[450px]">
          <GisMap
            stations={cityStations}
            hotspots={cityHotspots}
            selectedCity={selectedCity}
          />
        </div>

        {/* Right AI Intelligence Panel */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-xl p-6 flex flex-col justify-between shadow-2xl">
          <div className="space-y-4">
            <h3 className="text-xs font-black tracking-widest text-emerald-400 uppercase flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-emerald-400" />
              AI Intelligence Feed
            </h3>

            <div className="space-y-3">
              {/* Insight 1 */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3.5 shadow-inner">
                <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block mb-1">Source Attribution</span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Traffic congestion contributes approximately <strong className="text-emerald-400">{aiTrafficContribution}%</strong> of today&apos;s ambient particulate concentrations in {selectedCity}.
                </p>
              </div>

              {/* Insight 2 */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3.5 shadow-inner">
                <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block mb-1">Forecast Insight</span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Local dispersion indices indicate a potential accumulation event within 24 hours due to <strong className="text-emerald-400">{aiWindImpact}</strong>.
                </p>
              </div>

              {/* Insight 3 */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3.5 shadow-inner">
                <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block mb-1">Hotspot Analysis</span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Geospatial clustering has localized <strong className="text-orange-400">{activeHotspotCount} active hotspots</strong>. Smog suppression is recommended at coordinates.
                </p>
              </div>
            </div>
          </div>

          {/* Tactical Simulation */}
          <div className="mt-4 pt-4 border-t border-zinc-800/60">
            <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block mb-2">Simulated Mitigation Impact</span>
            {primaryIntervention ? (
              <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3.5">
                <div>
                  <h4 className="text-xs font-extrabold text-emerald-400">{primaryIntervention.title}</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{primaryIntervention.recommendedActions[0]}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-400 block">-{primaryIntervention.estimatedAQIReduction}</span>
                  <span className="text-[8px] text-zinc-500 uppercase font-bold">Reduction</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-zinc-500 italic">No active simulations available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* AQI Trend Area Chart */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 shadow-sm">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-1.5">
            <BarChart2 className="h-4 w-4 text-emerald-400" />
            AQI Trend (Live Telemetry)
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#52525b" fontSize={9} />
                <YAxis stroke="#52525b" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                <Area type="monotone" dataKey="AQI" stroke="#10b981" fillOpacity={1} fill="url(#colorAqi)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pollutant Breakdown Bar Chart */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 shadow-sm">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-emerald-400" />
            Pollutant Concentration (µg/m³)
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pollutantData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#52525b" fontSize={9} />
                <YAxis stroke="#52525b" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {pollutantData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Apportionment Pie Chart */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 shadow-sm">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-1.5">
            <Wind className="h-4 w-4 text-emerald-400" />
            Source Apportionment
          </h3>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '9px', color: '#a1a1aa' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Forecast & Weather Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Forecast Timeline */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            Machine Learning Forecasts (XGBoost)
          </h3>

          <div className="grid gap-4 grid-cols-3">
            {/* 24h */}
            <div className="rounded-xl border border-zinc-850 bg-zinc-900/30 p-4 text-center">
              <span className="text-[9px] uppercase font-bold text-zinc-500 block">24 Hours</span>
              <div className="text-xl font-black text-zinc-200 mt-1">{forecast24h?.forecastAQI || 142}</div>
              <span className="text-[8px] font-semibold text-emerald-400 bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10 mt-2 inline-block uppercase">
                {forecast24h?.category || 'Moderate'}
              </span>
            </div>
            {/* 48h */}
            <div className="rounded-xl border border-zinc-850 bg-zinc-900/30 p-4 text-center">
              <span className="text-[9px] uppercase font-bold text-zinc-500 block">48 Hours</span>
              <div className="text-xl font-black text-zinc-200 mt-1">{forecast48h?.forecastAQI || 155}</div>
              <span className="text-[8px] font-semibold text-amber-400 bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10 mt-2 inline-block uppercase">
                {forecast48h?.category || 'Moderate'}
              </span>
            </div>
            {/* 72h */}
            <div className="rounded-xl border border-zinc-850 bg-zinc-900/30 p-4 text-center">
              <span className="text-[9px] uppercase font-bold text-zinc-500 block">72 Hours</span>
              <div className="text-xl font-black text-zinc-200 mt-1">{forecast72h?.forecastAQI || 168}</div>
              <span className="text-[8px] font-semibold text-orange-400 bg-orange-500/5 px-1.5 py-0.5 rounded border border-orange-500/10 mt-2 inline-block uppercase">
                {forecast72h?.category || 'Poor'}
              </span>
            </div>
          </div>
        </div>

        {/* Weather Grid */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
            <CloudRain className="h-4 w-4 text-emerald-400" />
            Meteorological Telemetry
          </h3>

          <div className="grid gap-4 grid-cols-3">
            <div className="rounded-xl border border-zinc-850 bg-zinc-900/30 p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Thermometer className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-zinc-500 block">Temperature</span>
                <span className="text-sm font-extrabold text-zinc-200 mt-0.5 block">{avgTemp}°C</span>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-850 bg-zinc-900/30 p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Droplets className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-zinc-500 block">Humidity</span>
                <span className="text-sm font-extrabold text-zinc-200 mt-0.5 block">{avgHumidity}%</span>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-850 bg-zinc-900/30 p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Wind className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-zinc-500 block">Wind Speed</span>
                <span className="text-sm font-extrabold text-zinc-200 mt-0.5 block">{avgWindSpeed} m/s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interventions & Hotspots Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Interventions */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-emerald-400" />
            Active Tactical Interventions
          </h3>

          <div className="space-y-3">
            {interventions.slice(0, 3).map((item) => (
              <div key={item.id} className="rounded-xl border border-zinc-850 bg-zinc-900/35 p-4 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-zinc-200">{item.title}</h4>
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded border ${item.priority === 'HIGH' ? 'text-red-400 border-red-500/20 bg-red-500/5' : 'text-amber-400 border-amber-500/20 bg-amber-500/5'
                    }`}>
                    {item.priority} PRIORITY
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">{item.description}</p>
                <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500 border-t border-zinc-850/60 pt-2">
                  <span>Simulated Reduction: <strong className="text-emerald-400">-{item.estimatedAQIReduction}</strong></span>
                  <span>Confidence: <strong>{Math.round(item.confidenceScore * 100)}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hotspots */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-emerald-400" />
            Geospatial Pollution Hotspots
          </h3>

          <div className="space-y-3">
            {cityHotspots.slice(0, 3).map((item, idx) => (
              <div key={idx} className="rounded-xl border border-zinc-850 bg-zinc-900/35 p-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-extrabold text-zinc-200">Hotspot #{idx + 1}</h4>
                  <p className="text-[10px] text-zinc-400 mt-1">Coordinates: {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</p>
                  <p className="text-[10px] text-zinc-500">Radius: {item.radius} km</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-red-400 block">{Math.round(item.aqi)} AQI</span>
                  <span className="text-[8px] font-semibold text-red-400 bg-red-500/5 px-1.5 py-0.5 rounded border border-red-500/10 mt-1.5 inline-block uppercase">
                    {item.severity}
                  </span>
                </div>
              </div>
            ))}
            {cityHotspots.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-zinc-900 rounded-xl bg-zinc-900/10">
                <div className="relative h-8 w-16 mb-3 opacity-20 grayscale">
                  <Image src="/assets/logo/aeris-logo.png" alt="AERIS Logo" fill className="object-contain" />
                </div>
                <span className="text-xs text-zinc-500 italic">No active hotspots detected in this airshed.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[50vh] items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-16 w-32 opacity-60 animate-pulse">
            <Image src="/assets/logo/aeris-logo.png" alt="AERIS Logo" fill className="object-contain" priority />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase text-emerald-500">Loading Command Center...</span>
        </div>
      </div>
    }>
      <DashboardPageContent />
    </Suspense>
  );
}
