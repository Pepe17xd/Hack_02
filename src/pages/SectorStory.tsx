import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { EmptyState } from "../components/common/EmptyState";
import { getApiErrorMessage } from "../services/api";
import { getSectorStory } from "../services/tropelService";
import type { SectorStoryResponse, StoryStage } from "../types";

export default function SectorStory() {
  const { id } = useParams();
  const [story, setStory] = useState<SectorStoryResponse | null>(null);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const stageRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    getSectorStory(id, controller.signal)
      .then((data) => setStory({ ...data, stages: [...data.stages].sort((a, b) => a.order - b.order) }))
      .catch((err) => { if (!controller.signal.aborted) setError(getApiErrorMessage(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    const nodes = stageRefs.current.filter(Boolean) as HTMLElement[];
    if (nodes.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(Number((visible.target as HTMLElement).dataset.index));
    }, { rootMargin: "-20% 0px -35% 0px", threshold: [0.2, 0.45, 0.7] });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [story]);

  const current = useMemo(() => story?.stages[active], [story, active]);

  function jumpToStage(index: number) {
    setActive(index);
    stageRefs.current[index]?.focus({ preventScroll: true });
    stageRefs.current[index]?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  if (loading) return <p className="rounded-3xl bg-slate-900 p-8">Cargando story engine...</p>;
  if (error) return <EmptyState title="No se pudo cargar la historia" description={error} />;
  if (!story || !current) return <EmptyState title="Sin historia" description="El endpoint no devolvio etapas." />;

  return (
    <section className="story-transition space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Sector Story Engine</p>
          <h2 className="text-3xl font-black">{story.sector.name}</h2>
          <p className="text-slate-400">{story.sector.climate}</p>
        </div>
        <Link to="/sectors" className="rounded-xl bg-slate-800 px-4 py-2">Volver a sectores</Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.85fr)_1.15fr]">
        <aside className="top-28 h-fit rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:sticky" aria-live="polite">
          <div className="mb-4 h-2 rounded-full bg-slate-950"><div className="h-2 rounded-full bg-cyan-300 transition-all" style={{ width: `${Math.round(((active + 1) / story.stages.length) * 100)}%` }} /></div>
          <Visual stage={current} />
          <div className="mt-5 grid grid-cols-3 gap-2 text-center"><Metric label="Stability" value={current.metrics.stability} /><Metric label="Energy" value={current.metrics.energy} /><Metric label="Alerts" value={current.metrics.alerts} /></div>
          <p className="mt-4 text-sm text-slate-400">Etapa {active + 1} de {story.stages.length}. Progreso {Math.round(current.progress * 100)}%.</p>
          <div className="mt-4 grid grid-cols-4 gap-2" aria-label="Etapas de historia">
            {story.stages.map((stage, index) => <button key={stage.id} onClick={() => jumpToStage(index)} className={`h-9 rounded-lg text-xs font-bold ${index === active ? "bg-cyan-300 text-slate-950" : "bg-slate-950 text-slate-300 hover:bg-slate-800"}`}>{stage.order + 1}</button>)}
          </div>
        </aside>
        <div className="space-y-10">
          {story.stages.map((stage, index) => <article key={stage.id} tabIndex={0} data-index={index} ref={(node) => { stageRefs.current[index] = node; }} onFocus={() => setActive(index)} className="scroll-stage min-h-[70vh] rounded-2xl border border-slate-800 bg-slate-900/70 p-8 outline-none focus:border-cyan-300"><p className="text-sm font-bold text-cyan-300">#{stage.order + 1} - {stage.dominantEvent}</p><h3 className="mt-3 text-3xl font-black">{stage.title}</h3><p className="mt-5 text-lg leading-8 text-slate-300">{stage.narrative}</p><dl className="mt-6 grid gap-3 md:grid-cols-3"><Metric label="Stability" value={stage.metrics.stability} /><Metric label="Energy" value={stage.metrics.energy} /><Metric label="Alerts" value={stage.metrics.alerts} /></dl></article>)}
        </div>
      </div>
    </section>
  );
}

function tokenColor(token: string): string {
  const colors: Record<string, string> = {
    emerald: "#34d399",
    cyan: "#22d3ee",
    violet: "#a78bfa",
    amber: "#fbbf24",
    rose: "#fb7185",
    blue: "#60a5fa",
  };
  return colors[token] ?? "#67e8f9";
}

function Visual({ stage }: { stage: StoryStage }) {
  const color = tokenColor(stage.colorToken);
  return <div className="story-visual relative aspect-square overflow-hidden rounded-2xl border border-cyan-300/20 bg-slate-950" style={{ "--stage-color": color } as CSSProperties}><div className="absolute inset-6 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: color }} /><div className="story-visual-shape absolute inset-12 rounded-[35%] border border-cyan-200/40 bg-gradient-to-br from-slate-800 to-slate-950 transition-transform duration-500" style={{ transform: `rotate(${stage.order * 12}deg) scale(${1 + stage.progress * 0.18})`, boxShadow: `0 0 70px ${color}33` }} /><div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-slate-950/75 p-4 backdrop-blur"><p className="font-bold text-cyan-200">{stage.title}</p><p className="text-xs text-slate-400">{stage.assetKey} - {stage.colorToken}</p></div></div>;
}
function Metric({ label, value }: { label: string; value: string | number }) { return <div className="rounded-2xl bg-slate-950 p-3"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 font-black text-cyan-200">{value}</dd></div>; }

