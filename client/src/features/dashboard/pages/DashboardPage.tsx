import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getUser } from "../../../lib/api";

type Stats = {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  urgent: number;
};

function DashboardPage() {
  const user = getUser();
  const [stats, setStats] = useState<Stats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    urgent: 0,
  });
  const [error, setError] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void api<{ stats: Stats }>("/dashboard/stats")
        .then((result) => setStats(result.stats))
        .catch((e: unknown) =>
          setError(e instanceof Error ? e.message : "Unable to load dashboard"),
        );
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const cards = [
    {
      label: "Open tickets",
      value: stats.open,
      tone: "bg-cyan-50 text-cyan-700",
      icon: "◷",
    },
    {
      label: "In progress",
      value: stats.inProgress,
      tone: "bg-violet-50 text-violet-700",
      icon: "↗",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      tone: "bg-emerald-50 text-emerald-700",
      icon: "✓",
    },
    {
      label: "Urgent attention",
      value: stats.urgent,
      tone: "bg-rose-50 text-rose-700",
      icon: "!",
    },
  ];

  return (
    <div
      className="mx-auto max-w-[1400px]
  "
    >
      <section className="relative overflow-hidden rounded-2xl bg-[#101827] px-6 py-7 text-white shadow-xl shadow-slate-200 sm:px-8">
        <div className="relative z-10 max-w-xl">
          <p className="text-sm font-medium text-cyan-300">
            Good to see you, {user?.name.split(" ")[0] ?? "there"}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Keep every request moving forward.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Stay on top of customer conversations, priorities, and resolutions
            from one calm workspace.
          </p>
          <Link
            to="/tickets"
            className="mt-6 inline-flex rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            Open ticket workspace <span className="ml-2">→</span>
          </Link>
        </div>
        <div className="absolute -right-12 -top-20 h-72 w-72 rounded-full border-[32px] border-cyan-400/10" />
        <div className="absolute -bottom-32 right-20 h-64 w-64 rounded-full border-[24px] border-violet-400/10" />
      </section>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${card.tone}`}
              >
                {card.icon}
              </span>
            </div>
            <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Across your current workspace
            </p>
          </div>
        ))}
      </div>
      <section className="mt-7 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900">Workspace snapshot</h2>
            <p className="mt-1 text-sm text-slate-500">
              A quick view of your current workload.
            </p>
          </div>
          <Link
            to="/tickets"
            className="text-sm font-semibold text-cyan-700 hover:text-cyan-600"
          >
            View all tickets →
          </Link>
        </div>
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
            style={{
              width: `${stats.total ? Math.min(100, (stats.resolved / stats.total) * 100) : 0}%`,
            }}
          />
        </div>
        <div className="mt-3 flex justify-between text-xs text-slate-400">
          <span>{stats.resolved} resolved</span>
          <span>{stats.total} total tickets</span>
        </div>
      </section>
      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
    </div>
  );
}

export default DashboardPage;
