import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/common/EmptyState";
import { getApiErrorMessage } from "../services/api";
import { getSectors, getTropels } from "../services/tropelService";
import type { PaginatedTropels, SectorLite, TropelSort } from "../types";
import { readParam, writeParams } from "../utils/url";

const species = ["", "BLOBITO", "CHISPA", "GRUNON", "DORMILON", "GLITCHY"];
const states = ["", "ESTABLE", "HAMBRIENTO", "AGITADO", "MUTANDO", "CRITICO"];
const sizes = [10, 20, 50] as const;
const sorts: Array<{ value: TropelSort; label: string }> = [
  { value: "updatedAt,desc", label: "Actualizados recientemente" },
  { value: "name,asc", label: "Nombre A-Z" },
  { value: "chaosIndex,desc", label: "Mayor caos" },
];

function numberParam(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

export default function Tropels() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<PaginatedTropels | null>(null);
  const [sectors, setSectors] = useState<SectorLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const query = useMemo(() => {
    const size = Number(readParam(params, "size", "20"));
    const sort = readParam(params, "sort", "updatedAt,desc") as TropelSort;
    return {
      page: numberParam(readParam(params, "page", "0"), 0),
      size: (sizes.includes(size as 10 | 20 | 50) ? size : 20) as 10 | 20 | 50,
      species: readParam(params, "species"),
      vitalState: readParam(params, "vitalState"),
      sectorId: readParam(params, "sectorId"),
      q: readParam(params, "q"),
      sort: sorts.some((item) => item.value === sort) ? sort : "updatedAt,desc",
    };
  }, [params]);

  useEffect(() => {
    const controller = new AbortController();
    getSectors(controller.signal).then((r) => setSectors(r.items)).catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const current = ++requestId.current;
    setLoading(true);
    setError("");
    getTropels(query, controller.signal)
      .then((result) => { if (current === requestId.current) setData(result); })
      .catch((err) => { if (!axios.isCancel(err) && current === requestId.current) setError(getApiErrorMessage(err)); })
      .finally(() => { if (current === requestId.current) setLoading(false); });
    return () => controller.abort();
  }, [query]);

  function update(updates: Record<string, string | number>) {
    setParams(writeParams(params, { page: 0, ...updates }));
  }

  return (
    <section className="space-y-5">
      <div><p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Checkpoint 2</p><h2 className="text-3xl font-black">Atlas de Tropeles</h2></div>
      <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-7">
        <input value={query.q} onChange={(e) => update({ q: e.target.value })} placeholder="Buscar" className="rounded-xl border border-slate-700 bg-slate-950 p-3 md:col-span-2" />
        <select value={query.species} onChange={(e) => update({ species: e.target.value })} className="rounded-xl border border-slate-700 bg-slate-950 p-3">{species.map((x) => <option key={x} value={x}>{x || "Species"}</option>)}</select>
        <select value={query.vitalState} onChange={(e) => update({ vitalState: e.target.value })} className="rounded-xl border border-slate-700 bg-slate-950 p-3">{states.map((x) => <option key={x} value={x}>{x || "Vital state"}</option>)}</select>
        <select value={query.sectorId} onChange={(e) => update({ sectorId: e.target.value })} className="rounded-xl border border-slate-700 bg-slate-950 p-3"><option value="">Sector</option>{sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <select value={query.sort} onChange={(e) => update({ sort: e.target.value })} className="rounded-xl border border-slate-700 bg-slate-950 p-3">{sorts.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
        <select value={query.size} onChange={(e) => update({ size: e.target.value })} className="rounded-xl border border-slate-700 bg-slate-950 p-3">{sizes.map((x) => <option key={x} value={x}>{x}/pag</option>)}</select>
      </div>
      <div className="min-h-[520px] rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
        {loading && <p className="pb-4 text-sm text-cyan-300">Cargando sin mover layout...</p>}
        {error && <EmptyState title="Error en tropeles" description={error} />}
        {!loading && !error && data?.content.length === 0 && <EmptyState title="Sin resultados" description="Cambia filtros o busqueda." />}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data?.content.map((t) => <article key={t.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><div className="flex items-start justify-between gap-2"><h3 className="text-lg font-bold">{t.name}</h3><span className="rounded-full bg-cyan-300/10 px-2 py-1 text-xs text-cyan-200">{t.species}</span></div><p className="mt-2 text-sm text-slate-400">Sector: {t.sector.name} - Guardian: {t.guardianName}</p><div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm"><Metric label="Estado" value={t.vitalState} /><Metric label="Energia" value={t.energyLevel} /><Metric label="Caos" value={t.chaosIndex} /></div></article>)}
        </div>
      </div>
      {data && <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-400">Pagina {data.currentPage + 1} de {data.totalPages} - {data.totalElements} resultados</p><div className="flex gap-2"><button disabled={query.page <= 0 || loading} onClick={() => setParams(writeParams(params, { page: query.page - 1 }))} className="rounded-xl bg-slate-800 px-4 py-2 disabled:opacity-40">Anterior</button><button disabled={query.page >= data.totalPages - 1 || loading} onClick={() => setParams(writeParams(params, { page: query.page + 1 }))} className="rounded-xl bg-cyan-300 px-4 py-2 font-bold text-slate-950 disabled:opacity-40">Siguiente</button></div></div>}
    </section>
  );
}
function Metric({ label, value }: { label: string; value: string | number }) { return <div className="rounded-xl bg-slate-950 p-2"><p className="text-xs text-slate-500">{label}</p><p className="font-bold">{value}</p></div>; }

