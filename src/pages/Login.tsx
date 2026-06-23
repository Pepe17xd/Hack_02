import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../services/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [teamCode, setTeamCode] = useState(import.meta.env.VITE_TEAM_CODE ?? "");
  const [email, setEmail] = useState(import.meta.env.VITE_DEFAULT_EMAIL ?? "operator@tuckersoft.com");
  const [password, setPassword] = useState(import.meta.env.VITE_DEFAULT_PASSWORD ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(teamCode.trim(), email.trim(), password);
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/dashboard";
      navigate(from, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#155e75,#020617_55%)] text-slate-100 grid place-items-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl border border-cyan-300/20 bg-slate-950/80 p-8 shadow-2xl shadow-cyan-950/50 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Pizza Protocol</p>
        <h1 className="mt-3 text-3xl font-black">Encender consola</h1>
        <p className="mt-2 text-sm text-slate-400">Ingresa las credenciales asignadas por el TA.</p>
        {error && <div className="mt-4 rounded-xl border border-rose-400/50 bg-rose-950/40 p-3 text-sm text-rose-200">{error}</div>}
        <label className="mt-5 block text-sm font-semibold">Team Code</label>
        <input value={teamCode} onChange={(e) => setTeamCode(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 outline-none focus:border-cyan-300" placeholder="TEAM-0XX" required />
        <label className="mt-4 block text-sm font-semibold">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 outline-none focus:border-cyan-300" placeholder="operator@tuckersoft.com" type="email" required />
        <label className="mt-4 block text-sm font-semibold">Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 outline-none focus:border-cyan-300" placeholder="password del equipo" type="password" required />
        <button disabled={loading} className="mt-6 w-full rounded-xl bg-cyan-300 px-4 py-3 font-black text-slate-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Autenticando..." : "Ingresar"}</button>
      </form>
    </div>
  );
}
