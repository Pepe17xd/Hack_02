import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { preloadSectors } from "../../services/tropelService";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? "bg-cyan-400 text-slate-950" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`;

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) void preloadSectors().catch(() => undefined);
  }, [user]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Tuckersoft</p>
            <h1 className="text-xl font-bold">TropelCare Control Room</h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
            <NavLink to="/tropels" className={linkClass}>Tropeles</NavLink>
            <NavLink to="/signals" className={linkClass}>Senales</NavLink>
            <NavLink to="/sectors" className={linkClass}>Sectores</NavLink>
          </nav>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <span>{user?.displayName} - {user?.teamCode}</span>
            <button onClick={handleLogout} className="rounded-xl bg-rose-500 px-3 py-2 font-semibold text-white hover:bg-rose-400">Logout</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6"><Outlet /></main>
    </div>
  );
}
