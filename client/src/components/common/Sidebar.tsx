import { NavLink } from "react-router-dom";

function Sidebar() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-4 py-3 transition ${
      isActive
        ? "bg-slate-800 text-white"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <aside className="flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-white">
      <div className="border-b border-slate-800 p-6">
        <h1 className="text-2xl font-bold">RESOLVE</h1>
        <p className="mt-1 text-xs text-slate-400">
          Support Platform
        </p>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <NavLink to="/" className={navLinkClass}>
            Dashboard
          </NavLink>

          <NavLink to="/tickets" className={navLinkClass}>
            Tickets
          </NavLink>

          <NavLink to="/notifications" className={navLinkClass}>
            Notifications
          </NavLink>
        </div>
      </nav>

      <div className="border-t border-slate-800 p-4">
        <NavLink
          to="/login"
          className="block rounded-lg px-4 py-3 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          Logout
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;