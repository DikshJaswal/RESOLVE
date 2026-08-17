import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api, getUser } from "../../lib/api";

type Notification = { is_read: boolean };

function Header({ onMenu }: { onMenu: () => void }) {
  const user = getUser();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const title =
    location.pathname === "/"
      ? "Overview"
      : location.pathname.slice(1).replace(/\//g, " / ").replace(/-/g, " ");
  const initials =
    user?.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  useEffect(() => {
    let active = true;
    void api<{ notifications: Notification[] }>("/notifications")
      .then((result) => {
        if (active)
          setUnread(
            result.notifications.filter((item) => !item.is_read).length,
          );
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenu}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Workspace
          </p>
          <h2 className="mt-1 text-lg font-bold capitalize tracking-tight text-slate-900">
            {title}
          </h2>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-5">
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="group relative rounded-xl p-2.5 text-slate-400 transition hover:bg-cyan-50 hover:text-cyan-700"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
          </svg>
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-bold text-slate-900">
            {user?.name ?? "User"}
          </p>
          <p className="mt-0.5 text-xs capitalize text-slate-500">
            {user?.role.toLowerCase() ?? "customer"}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-extrabold text-white ring-4 ring-slate-100">
          {initials}
        </div>
      </div>
    </header>
  );
}

export default Header;
