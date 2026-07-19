"use client";
import { useState } from 'react';

export function AdvisoryCard({ advisory }: { advisory: any }) {
  const [lang, setLang] = useState(advisory.language || 'en');
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
      <div className="flex justify-between items-center">
        <span className="text-xs uppercase tracking-wider text-zinc-500">{advisory.city}</span>
        <span className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400">Vuln {Math.round((advisory.vulnerabilityScore ?? 0) * 100)}%</span>
      </div>
      <p className="text-sm text-zinc-200 mt-3">{advisory.message}</p>
      <div className="mt-3 text-xs text-zinc-500">Risk: {advisory.riskLevel} · Lang: {lang.toUpperCase()}</div>
    </div>
  );
}
