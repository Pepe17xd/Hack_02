import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { EmptyState } from "../components/common/EmptyState";
import { getApiErrorMessage } from "../services/api";
import { getSignal, updateSignalStatus } from "../services/signalService";
import type { Signal, SignalStatus } from "../types";

const updatedSignalKey = "tropelcare_updated_signal";

export default function SignalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/signals";
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    getSignal(id, controller.signal)
      .then(setSignal)
      .catch((err) => { if (!controller.signal.aborted) setError(getApiErrorMessage(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id]);

  async function changeStatus(status: Extract<SignalStatus, "PROCESANDO" | "ATENDIDA">) {
    if (!id || !signal) return;
    const previous = signal;
    setActionLoading(true);
    setActionMessage("");
    setError("");
    try {
      const updated = await updateSignalStatus(id, status);
      setSignal(updated);
      sessionStorage.setItem(updatedSignalKey, JSON.stringify(updated));
      setActionMessage(`Estado actualizado a ${updated.status}`);
    } catch (err) {
      setSignal(previous);
      setError(`${getApiErrorMessage(err)}. Puedes reintentar.`);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <p className="rounded-3xl bg-slate-900 p-8">Cargando detalle real...</p>;
  if (error && !signal) return <EmptyState title="No se pudo cargar la senal" description={error} />;
  if (!signal) return <EmptyState title="No encontrada" description="El backend no devolvio la senal." />;

  return (
    <section className="space-y-5">
      <button onClick={() => navigate(from)} className="rounded-xl bg-slate-800 px-4 py-2 hover:bg-slate-700">Volver conservando scroll</button>
      <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Checkpoint 4</p>
        <h2 className="mt-2 text-3xl font-black">{signal.signalType} - {signal.tropel.name}</h2>
        <p className="mt-4 text-slate-300">{signal.rawContent}</p>
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <Box label="Estado" value={signal.status} />
          <Box label="Severidad" value={signal.severity} />
          <Box label="Tropel" value={`${signal.tropel.name} (${signal.tropel.species})`} />
          <Box label="Actualizado" value={new Date(signal.updatedAt).toLocaleString()} />
        </div>
        {error && <div className="mt-5 rounded-xl border border-rose-400/40 bg-rose-950/30 p-3 text-rose-200">{error}</div>}
        {actionMessage && <div className="mt-5 rounded-xl border border-emerald-400/40 bg-emerald-950/30 p-3 text-emerald-200">{actionMessage}</div>}
        <div className="mt-6 flex flex-wrap gap-3">
          <button disabled={actionLoading || signal.status === "PROCESANDO"} onClick={() => changeStatus("PROCESANDO")} className="rounded-xl bg-amber-300 px-4 py-2 font-bold text-slate-950 disabled:opacity-50">Marcar PROCESANDO</button>
          <button disabled={actionLoading || signal.status === "ATENDIDA"} onClick={() => changeStatus("ATENDIDA")} className="rounded-xl bg-emerald-300 px-4 py-2 font-bold text-slate-950 disabled:opacity-50">Marcar ATENDIDA</button>
          <Link to="/signals" className="rounded-xl bg-slate-800 px-4 py-2">Ir al feed</Link>
        </div>
      </article>
    </section>
  );
}
function Box({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-slate-950 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 font-bold">{value}</p></div>; }
