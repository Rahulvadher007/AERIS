"use client";
import { useEvidence } from '@/hooks/useEvidence';
import { motion } from 'framer-motion';

export default function EvidencePage() {
  const { data, isLoading } = useEvidence();
  if (isLoading) return <div className="p-10 text-zinc-400">Loading evidence…</div>;
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-10">
      <h1 className="text-3xl font-black text-emerald-400">AERIS — Judging Evidence</h1>
      <p className="text-zinc-400 mt-2">Live proof against hackathon evaluation focus.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card title="Forecast RMSE vs Persistence" value={`${data?.rmseVsPersistence ?? '—'}`} hint="Lower is better — XGBoost beats naive baseline" />
        <Card title="Avg Attribution Confidence" value={`${Math.round((data?.attributionConfidenceAvg ?? 0) * 100)}%`} hint="Data-driven source apportionment" />
        <Card title="Signal → Intervention" value={`${data?.signalToInterventionMins ?? 0} min`} hint="Hotspot detect to mitigation plan" />
        <Card title="Multi-City Coverage" value={`${data?.multiCityCount ?? 0}`} hint="Scalable across urban centres" />
      </div>
    </div>
  );
}

function Card({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
      <div className="text-xs uppercase tracking-wider text-zinc-500">{title}</div>
      <div className="text-3xl font-black text-emerald-400 mt-2">{value}</div>
      <div className="text-xs text-zinc-500 mt-2">{hint}</div>
    </motion.div>
  );
}
