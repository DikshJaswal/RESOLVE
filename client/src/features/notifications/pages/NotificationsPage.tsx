import { useEffect, useState } from "react";
import { api } from "../../../lib/api";

type Notification = {
  id: number;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  ticket_title: string | null;
};

const icons: Record<string, string> = {
  TICKET_ASSIGNED: "↗",
  TICKET_REPLY: "✦",
  STATUS_CHANGED: "◷",
  PRIORITY_CHANGED: "!",
};

function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [error, setError] = useState("");
  const unread = items.filter((item) => !item.is_read).length;

  async function load() {
    try {
      const result = await api<{ notifications: Notification[] }>(
        "/notifications",
      );
      setItems(result.notifications);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load notifications");
    }
  }
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []);
  async function markRead(id: number) {
    try {
      await api(`/notifications/${id}/read`, { method: "PATCH" });
      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, is_read: true } : item,
        ),
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to update notification",
      );
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cyan-700">Stay in the loop</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Notifications
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Updates from your support workspace.
          </p>
        </div>
        {unread > 0 && (
          <span className="rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700">
            {unread} unread
          </span>
        )}
      </div>
      {error && (
        <div className="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => void markRead(item.id)}
              className={`flex w-full gap-4 p-5 text-left transition hover:bg-slate-50 ${!item.is_read ? "bg-cyan-50/30" : ""}`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${!item.is_read ? "bg-cyan-100 text-cyan-700" : "bg-slate-100 text-slate-400"}`}
              >
                {icons[item.type] ?? "•"}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-sm ${!item.is_read ? "font-bold text-slate-800" : "font-medium text-slate-600"}`}
                >
                  {item.message}
                </span>
                <span className="mt-1 block truncate text-xs text-slate-400">
                  {item.ticket_title ?? "General update"} ·{" "}
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </span>
              {!item.is_read && (
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-500" />
              )}
            </button>
          ))}
          {items.length === 0 && (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400">
                ◌
              </div>
              <p className="mt-4 font-semibold text-slate-700">
                You’re all caught up
              </p>
              <p className="mt-1 text-sm text-slate-400">
                New ticket activity will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
