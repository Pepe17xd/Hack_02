import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/common/EmptyState";
import { getApiErrorMessage } from "../services/api";
import { getSignalFeed } from "../services/signalService";
import type { Signal, SignalFeedResponse } from "../types";
import { readParam, writeParams } from "../utils/url";

const signalTypes = ["", "HAMBRE", "ABANDONO", "MUTACION", "FUGA", "CONFLICTO", "REPRODUCCION_MASIVA", "SENAL_CORRUPTA"];
const severities = ["", "LEVE", "MODERADO", "GRAVE", "CRITICO"];
const statuses = ["", "RECIBIDA", "PROCESANDO", "ATENDIDA"];
const updatedSignalKey = "tropelcare_updated_signal";

type FeedCache = {
  items: Signal[];
  nextCursor: string | null;
  hasMore: boolean;
  totalEstimate: number;
  scrollY: number;
};

const feedCache = new Map<string, FeedCache>();

export default function Signals() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();

  const filters = useMemo(() => ({
    signalType: readParam(params, "signalType"),
    severity: readParam(params, "severity"),
    status: readParam(params, "status"),
    q: readParam(params, "q"),
  }), [params]);
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
  const cached = feedCache.get(filtersKey);

  const [items, setItems] = useState<Signal[]>(() => cached?.items ?? []);
  const [nextCursor, setNextCursor] = useState<string | null>(() => cached?.nextCursor ?? null);
  const [hasMore, setHasMore] = useState(() => cached?.hasMore ?? true);
  const [totalEstimate, setTotalEstimate] = useState(() => cached?.totalEstimate ?? 0);
  const [loadingFirst, setLoadingFirst] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const observerTarget = useRef<HTMLDivElement | null>(null);
  const requestId = useRef(0);
  const inFlight = useRef(false);

  const saveCache = useCallback((patch?: Partial<FeedCache>) => {
    const previous = feedCache.get(filtersKey);
    feedCache.set(filtersKey, {
      items,
      nextCursor,
      hasMore,
      totalEstimate,
      scrollY: previous?.scrollY ?? window.scrollY,
      ...patch,
    });
  }, [filtersKey, hasMore, items, nextCursor, totalEstimate]);

  const mergePage = useCallback((page: SignalFeedResponse, reset: boolean) => {
    setItems((prev) => {
      const map = new Map<string, Signal>();
      if (!reset) prev.forEach((item) => map.set(item.id, item));
      page.items.forEach((item) => map.set(item.id, item));
      return Array.from(map.values());
    });
    setNextCursor(page.nextCursor);
    setHasMore(page.hasMore);
    setTotalEstimate(page.totalEstimate);
  }, []);

  const loadPage = useCallback(async (cursor: string | null, reset: boolean) => {
    if (inFlight.current) return;
    inFlight.current = true;
    const current = ++requestId.current;
    const controller = new AbortController();
    setError("");
    reset ? setLoadingFirst(true) : setLoadingMore(true);
    try {
      const page = await getSignalFeed({ ...filters, cursor, limit: 15 }, controller.signal);
      if (current === requestId.current) mergePage(page, reset);
    } catch (err) {
      if (!axios.isCancel(err) && current === requestId.current) setError(getApiErrorMessage(err));
    } finally {
      if (current === requestId.current) {
        setLoadingFirst(false);
        setLoadingMore(false);
        inFlight.current = false;
      }
    }
  }, [filters, mergePage]);

  useEffect(() => {
    const nextCached = feedCache.get(filtersKey);
    requestId.current += 1;
    inFlight.current = false;
    setError("");

    if (nextCached && nextCached.items.length > 0) {
      setItems(nextCached.items);
      setNextCursor(nextCached.nextCursor);
      setHasMore(nextCached.hasMore);
      setTotalEstimate(nextCached.totalEstimate);
      setLoadingFirst(false);
      setLoadingMore(false);
      window.setTimeout(() => window.scrollTo({ top: nextCached.scrollY, behavior: "auto" }), 0);
      return;
    }

    setItems([]);
    setNextCursor(null);
    setHasMore(true);
    setTotalEstimate(0);
    void loadPage(null, true);
  }, [filtersKey, loadPage]);

  useEffect(() => {
    saveCache();
  }, [saveCache]);

  useEffect(() => {
    const raw = sessionStorage.getItem(updatedSignalKey);
    if (!raw) return;
    sessionStorage.removeItem(updatedSignalKey);
    try {
      const updated = JSON.parse(raw) as Signal;
      setItems((prev) => prev.map((item) => item.id === updated.id ? updated : item));
      const current = feedCache.get(filtersKey);
      if (current) {
        feedCache.set(filtersKey, {
          ...current,
          items: current.items.map((item) => item.id === updated.id ? updated : item),
        });
      }
    } catch {
      // Ignore malformed cache data from an older session.
    }
  }, [filtersKey]);

  useEffect(() => {
    const node = observerTarget.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingFirst && !loadingMore && !error) {
        void loadPage(nextCursor, false);
      }
    }, { rootMargin: "300px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadingFirst, loadingMore, error, nextCursor, loadPage]);

  function update(updates: Record<string, string>) {
    saveCache({ scrollY: window.scrollY });
    setParams(writeParams(params, updates));
  }

  function rememberScroll() {
    saveCache({ scrollY: window.scrollY });
  }

  function retry() {
    void loadPage(items.length === 0 ? null : nextCursor, items.length === 0);
  }

  return (
    <section className="space-y-5">
      <div><p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Checkpoints 3 y 4</p><h2 className="text-3xl font-black">Feed infinito de senales</h2></div>
      <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-5">
        <input value={filters.q} onChange={(e) => update({ q: e.target.value })} placeholder="Buscar senal" className="rounded-xl border border-slate-700 bg-slate-950 p-3 md:col-span-2" />
        <select value={filters.signalType} onChange={(e) => update({ signalType: e.target.value })} className="rounded-xl border border-slate-700 bg-slate-950 p-3">{signalTypes.map((x) => <option key={x} value={x}>{x || "Tipo"}</option>)}</select>
        <select value={filters.severity} onChange={(e) => update({ severity: e.target.value })} className="rounded-xl border border-slate-700 bg-slate-950 p-3">{severities.map((x) => <option key={x} value={x}>{x || "Severidad"}</option>)}</select>
        <select value={filters.status} onChange={(e) => update({ status: e.target.value })} className="rounded-xl border border-slate-700 bg-slate-950 p-3">{statuses.map((x) => <option key={x} value={x}>{x || "Estado"}</option>)}</select>
      </div>
      <p className="text-sm text-slate-400">Estimado total: {totalEstimate}. El feed conserva paginas cargadas y posicion al abrir un detalle.</p>
      <div className="min-h-[580px] space-y-3">
        {loadingFirst && <p className="rounded-2xl bg-slate-900 p-4 text-cyan-300">Cargando primera pagina...</p>}
        {!loadingFirst && items.length === 0 && !error && <EmptyState title="Sin senales" description="No hay senales con esos filtros." />}
        {items.map((s) => <Link key={s.id} to={`/signals/${s.id}`} state={{ from: `${location.pathname}${location.search}` }} onClick={rememberScroll} className="block rounded-2xl border border-slate-800 bg-slate-900 p-4 transition hover:border-cyan-300/60"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-bold">{s.signalType} - {s.tropel.name}</h3><div className="flex gap-2"><Badge>{s.severity}</Badge><Badge>{s.status}</Badge></div></div><p className="mt-2 text-sm text-slate-400">{s.rawContent}</p><p className="mt-3 text-xs text-slate-500">{new Date(s.createdAt).toLocaleString()} - ID {s.id}</p></Link>)}
        {error && <div className="rounded-2xl border border-rose-400/40 bg-rose-950/30 p-4"><p className="text-rose-200">{error}</p><button onClick={retry} className="mt-3 rounded-xl bg-rose-400 px-4 py-2 font-bold text-slate-950">Reintentar sin borrar paginas</button></div>}
        {loadingMore && <p className="rounded-2xl bg-slate-900 p-4 text-cyan-300">Cargando mas senales...</p>}
        {!hasMore && items.length > 0 && <p className="py-8 text-center text-slate-500">Fin de lista</p>}
        <div ref={observerTarget} className="h-8" aria-hidden="true" />
      </div>
    </section>
  );
}
function Badge({ children }: { children: React.ReactNode }) { return <span className="rounded-full bg-cyan-300/10 px-2 py-1 text-xs font-bold text-cyan-200">{children}</span>; }
