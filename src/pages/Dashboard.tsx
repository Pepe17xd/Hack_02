import { useEffect, useState } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { getApiErrorMessage } from "../services/api";
import { getDashboardSummary } from "../services/dashboardService";
import type { DashboardSummary } from "../types";

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getDashboardSummary(controller.signal)
      .then(setSummary)
      .catch((err) => { if (!controller.signal.aborted) setError(getApiErrorMessage(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  if (loading) return <section className="min-h-[420px] rounded-3xl bg-slate-900 p-8">Cargando dashboard real...</section>;
  if (error) return <EmptyState title="No se pudo cargar el dashboard" description={error} />;
  if (!summary) return <EmptyState title="Sin datos" description="El backend no devolvio indicadores." />;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Checkpoint 1</p>
        <h2 className="text-3xl font-black">Dashboard operativo</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card label="Tropeles" value={summary.totalTropels} />
        <Card label="Criticos" value={summary.criticalTropels} />
        <Card label="Senales abiertas" value={summary.openSignals} />
        <Card label="Estabilidad promedio" value={`${summary.sectorStabilityAvg}%`} />
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-xl font-bold">Senales por severidad</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {Object.entries(summary.signalsBySeverity).map(([key, value]) => <Card key={key} label={key} value={value} compact />)}
        </div>
        <p className="mt-4 text-sm text-slate-400">Generado: {new Date(summary.generatedAt).toLocaleString()}</p>
      </div>
    </section>
  );
}

function Card({ label, value, compact = false }: { label: string; value: number | string; compact?: boolean }) {
  return <div className={`rounded-2xl border border-slate-800 bg-slate-900/80 ${compact ? "p-4" : "p-6"}`}><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-3xl font-black text-cyan-200">{value}</p></div>;
}

