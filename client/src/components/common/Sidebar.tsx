import { NavLink, useNavigate } from "react-router-dom";
import { api, clearSession, getUser } from "../../lib/api";

type IconName = "home" | "ticket" | "bell" | "users" | "settings";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    home: "M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9 20v-6h6v6",
    ticket: "M4 7h16v10H4zM8 7v3m8-3v3M8 14h8",
    bell: "M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
    users:
      "M16 20v-1a4 4 0 0 0-8 0v1M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19 20v-1a3 3 0 0 0-2-2.8M16 6.2a3 3 0 0 1 0 5.6",
    settings:
      "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1h-2.4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L8 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6.7v-2.4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L8 8.6l1.7-1.7.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.1h2.4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v2.4H21a1.7 1.7 0 0 0-1.6 1Z",
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const user = getUser();
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${isActive ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/20" : "text-slate-400 hover:bg-white/[0.07] hover:text-white"}`;

  async function logout() {
    const refreshToken = localStorage.getItem("resolve_refresh_token");
    try {
      if (refreshToken)
        await api("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        });
    } finally {
      clearSession();
      navigate("/login");
    }
  }

  return (
    <>
      <button
        aria-label="Close navigation"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-950/50 transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[276px] flex-col border-r border-white/[0.08] bg-[#0d1728] text-white shadow-2xl transition-transform duration-300 lg:w-64 lg:translate-x-0 lg:shadow-none ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-[88px] items-center justify-between border-b border-white/[0.08] px-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400 text-sm font-black text-slate-950">
                R
              </span>
              <h1 className="text-xl font-extrabold tracking-tight">
                RESOLVE<span className="text-cyan-400">.</span>
              </h1>
            </div>
            <p className="mt-2 pl-10 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Support workspace
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl leading-none text-slate-500 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            ×
          </button>
        </div>
        <nav className="flex-1 px-4 py-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Workspace
          </p>
          <div className="space-y-1">
            <NavLink onClick={onClose} to="/" className={navClass}>
              <Icon name="home" />
              Dashboard
            </NavLink>
            <NavLink onClick={onClose} to="/tickets" className={navClass}>
              <Icon name="ticket" />
              Tickets
            </NavLink>
            <NavLink onClick={onClose} to="/notifications" className={navClass}>
              <Icon name="bell" />
              Notifications
            </NavLink>
          </div>
          <p className="mb-3 mt-10 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Manage
          </p>
          <div className="space-y-1">
            {user?.role === "ADMIN" && (
              <NavLink onClick={onClose} to="/admin" className={navClass}>
                <Icon name="users" />
                Staff administration
              </NavLink>
            )}
            <NavLink onClick={onClose} to="/settings" className={navClass}>
              <Icon name="settings" />
              Settings
            </NavLink>
          </div>
        </nav>
        <div className="border-t border-white/[0.08] p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.06] p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-sm font-extrabold text-slate-950">
              {user?.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {user?.name}
              </p>
              <p className="mt-0.5 text-xs capitalize text-slate-400">
                {user?.role.toLowerCase()}
              </p>
            </div>
          </div>
          <button
            onClick={() => void logout()}
            className="mt-3 w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
