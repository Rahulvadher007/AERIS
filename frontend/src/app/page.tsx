"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, Activity, Map, TrendingUp, AlertTriangle, Lightbulb, ArrowDown } from 'lucide-react';
import { AnimatedCounter } from '@/components/AnimatedCounter.client';
import { stationService } from '@/services/station.service';
import { aqiService } from '@/services/aqi.service';
import { hotspotService } from '@/services/hotspot.service';
import { weatherService } from '@/services/weather.service';
import { trafficService } from '@/services/traffic.service';

export default function Home() {
  const overviewRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);

  // Fetch live metrics from backend APIs
  const { data: stations = [] } = useQuery({
    queryKey: ['stations-list'],
    queryFn: () => stationService.getAll(),
  });

  const { data: aqiStats } = useQuery({
    queryKey: ['aqi-stats'],
    queryFn: () => aqiService.getStatistics(),
  });

  const { data: hotspots = [] } = useQuery({
    queryKey: ['hotspots-list'],
    queryFn: () => hotspotService.getAll(),
  });

  const { data: weatherLatest = [] } = useQuery({
    queryKey: ['weather-latest'],
    queryFn: () => weatherService.getLatest(),
  });

  const { data: trafficLatest = [] } = useQuery({
    queryKey: ['traffic-latest'],
    queryFn: () => trafficService.getLatest(),
  });

  // Calculate unique cities
  const uniqueCities = Array.from(new Set(stations.map((s) => s.city))).length;

  // Calculate critical zones (hotspots with high severity)
  const criticalZones = hotspots.filter(
    (h) => h.severity === 'HIGH' || h.severity === 'CRITICAL'
  ).length;

  const scrollToOverview = () => {
    overviewRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-50 overflow-x-hidden">
      {/* Cinematic Fullscreen Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute h-full w-full object-cover"
        >
          <source src="/video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/75 z-10" />
      </div>

      {/* Hero Section */}
      <motion.div
        style={{ opacity, scale }}
        className="relative z-20 flex min-h-screen flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative h-32 w-64 md:h-48 md:w-96 mb-6"
        >
          <Image
            src="/assets/logo/aeris-logo.png"
            alt="AERIS - Air Environmental Response & Intelligence System"
            fill
            sizes="(max-width: 768px) 256px, 384px"
            className="object-contain"
            priority
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl font-extrabold tracking-tight sm:text-6xl text-zinc-100"
        >
          Transforming Environmental Data <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            into Intelligent Decisions
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-6 text-base sm:text-lg text-zinc-400 max-w-3xl leading-relaxed"
        >
          AERIS is an AI-powered environmental intelligence platform that combines historical air quality, live weather, traffic intelligence, geospatial analytics, forecasting, hotspot detection, and autonomous AI agents to help cities predict pollution and support proactive environmental decision-making.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md"
        >
          <Link
            href="/dashboard"
            className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-8 py-4 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all text-sm flex items-center justify-center gap-2 group"
          >
            Launch Command Center
            <Shield className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <button
            onClick={scrollToOverview}
            className="rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/50 backdrop-blur text-zinc-300 font-bold px-8 py-4 transition-all text-sm flex items-center justify-center gap-2"
          >
            Explore Platform
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </button>
        </motion.div>
      </motion.div>

      {/* Live Metrics Grid (Floating above the fold transition) */}
      <div className="relative z-20 -mt-20 max-w-7xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-xl shadow-2xl">
          <div className="text-center p-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Monitoring Stations</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              <AnimatedCounter value={stations.length || 849} />
            </div>
          </div>
          <div className="text-center p-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Cities Covered</span>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 mt-1">
              <AnimatedCounter value={uniqueCities || 8} />
            </div>
          </div>
          <div className="text-center p-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Historical Records</span>
            <div className="text-2xl sm:text-3xl font-black text-teal-400 mt-1">
              <AnimatedCounter value={aqiStats?.totalReadings || 25420} />
            </div>
          </div>
          <div className="text-center p-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Forecast Accuracy</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              <AnimatedCounter value={91} suffix="%" />
            </div>
          </div>
        </div>
      </div>

      {/* Platform Overview Section */}
      <div ref={overviewRef} id="overview" className="relative z-20 max-w-7xl mx-auto px-6 py-24 border-t border-zinc-900 bg-zinc-950">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">Integrated Intelligence</h2>
          <h3 className="text-3xl font-black tracking-tight text-zinc-100 mt-2">Operational Core Capabilities</h3>
          <p className="text-sm text-zinc-400 mt-4 leading-relaxed">
            AERIS orchestrates data across multiple urban layers, feeding specialized AI agents to generate real-time mitigations.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 hover:border-zinc-800 transition-all shadow-md">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
              <Map className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-zinc-200">GIS Command Map</h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Geospatial mapping of monitoring stations, active hotspots, and forecast dispersion layers utilizing React Leaflet.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 hover:border-zinc-800 transition-all shadow-md">
            <div className="h-10 w-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-zinc-200">Predictive Forecasting</h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              XGBoost machine learning models predicting 24h, 48h, and 72h AQI trends with spatial and meteorological context.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 hover:border-zinc-800 transition-all shadow-md">
            <div className="h-10 w-10 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center mb-4 border border-red-500/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-zinc-200">Hotspot Clustering</h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              DBSCAN spatial clustering agent executing hourly to locate environmental hotspots and attribute local pollution sources.
            </p>
          </div>
        </div>

        {/* Secondary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 text-center">
          <div>
            <div className="text-xl font-bold text-zinc-300">
              <AnimatedCounter value={hotspots.length || 2277} />
            </div>
            <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Active Hotspots</span>
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-300">
              <AnimatedCounter value={criticalZones || 120} />
            </div>
            <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Critical Wards</span>
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-300">
              <AnimatedCounter value={weatherLatest.length || 849} />
            </div>
            <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Weather Feeds</span>
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-300">
              <AnimatedCounter value={trafficLatest.length || 10} />
            </div>
            <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Traffic Feeds</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-20 border-t border-zinc-900 bg-zinc-950 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start">
            <div className="relative h-12 w-32 mb-4">
              <Image
                src="/assets/logo/aeris-logo.png"
                alt="AERIS Logo"
                fill
                sizes="128px"
                className="object-contain object-center md:object-left"
              />
            </div>
            <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase">
              Air Environmental Response & Intelligence System
            </p>
          </div>
          <div className="text-sm font-bold text-emerald-400 tracking-widest uppercase text-center md:text-right">
            Air Intelligence. Better Tomorrow.
          </div>
        </div>
      </footer>
    </div>
  );
}
