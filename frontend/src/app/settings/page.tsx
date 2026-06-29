"use client";

import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">System Settings</h1>
      </div>

      <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center max-w-2xl">
        <Settings className="mx-auto h-8 w-8 text-zinc-600 mb-4 animate-spin-slow" />
        <h3 className="text-lg font-medium text-zinc-200">Settings Configuration</h3>
        <p className="mt-2 text-sm text-zinc-500">
          This panel is currently read-only. Mapbox keys and system parameters are managed via environment variables.
        </p>
      </div>
    </div>
  );
}
