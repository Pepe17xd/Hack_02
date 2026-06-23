import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EmptyState } from "../components/common/EmptyState";
import { getApiErrorMessage } from "../services/api";
import { getCachedSectors, getSectors } from "../services/tropelService";
import type { SectorLite } from "../types";

export default function Sectors() {
  const cached = getCachedSectors();
  const [sectors, setSectors] = useState<SectorLite[]>(cached?.items ?? []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (cached) return;
    const controller = new AbortController();
    setLoading(true);
    getSectors(controller.signal)
      .then((r) => setSectors(r.items))
      .catch((err) => { if (!controller.signal.aborted) setError(getApiErrorMessage(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [cached]);

  function openStory(id: string) {
    if (document.startViewTransition) document.startViewTransition(() => navigate(`/sectors/${id}/story`));
    else navigate(`/sectors/${id}/story`);
  }

  if (loading) return <p className="rounded-3xl bg-slate-900 p-8">Cargando sectores...</p>;
  if (error) return <EmptyState title="No se pudieron cargar sectores" description={error} />;

  return (
    <section className="story-transition space-y-5">
      <div><p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Checkpoint 5</p><h2 className="text-3xl font-black">Sectores</h2></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sectors.map((s) => <article key={s.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><h3 className="text-xl font-bold">{s.name}</h3><p className="mt-1 text-sm text-slate-400">{s.sectorCode} - {s.climate}</p><div className="mt-4 h-2 rounded-full bg-slate-950"><div className="h-2 rounded-full bg-cyan-300" style={{ width: `${s.stabilityLevel}%` }} /></div><p className="mt-2 text-sm text-slate-400">Carga {s.currentLoad}/{s.capacity} - estabilidad {s.stabilityLevel}%</p><button onClick={() => openStory(s.id)} className="mt-4 inline-block rounded-xl bg-cyan-300 px-4 py-2 font-bold text-slate-950">Abrir story</button></article>)}
      </div>
      <p className="text-sm text-slate-500">Tambien puedes entrar directo por <Link className="text-cyan-300" to="/sectors">/sectors</Link> y luego seleccionar una historia.</p>
    </section>
  );
}
