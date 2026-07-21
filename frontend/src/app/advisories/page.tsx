"use client";
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/api';
import { AdvisoryCard } from '@/components/AdvisoryCard';

export default function AdvisoriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['advisories'],
    queryFn: () => api.post<{ citizenAdvisories: any[] }>('/agents/coordinate'),
  });
  if (isLoading) return <div className="p-10 text-zinc-400">Generating advisories…</div>;
  const advisories = (data?.citizenAdvisories) || [];
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-10">
      <h1 className="text-3xl font-black text-emerald-400">Citizen Health Advisories</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {advisories.map((a: any, i: number) => <AdvisoryCard key={i} advisory={a} />)}
      </div>
    </div>
  );
}
