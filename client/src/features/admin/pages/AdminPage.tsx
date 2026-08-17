import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { api, getUser } from "../../../lib/api";

type Staff = {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

function AdminPage() {
  const user = getUser();
  const [users, setUsers] = useState<Staff[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "AGENT",
  });
  const [error, setError] = useState("");
  if (user?.role !== "ADMIN") return <Navigate to="/" replace />;
  async function load() {
    try {
      const result = await api<{ users: Staff[] }>("/users");
      setUsers(result.users);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load staff");
    }
  }
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []);
  async function create(event: FormEvent) {
    event.preventDefault();
    try {
      await api("/users", { method: "POST", body: JSON.stringify(form) });
      setForm({ name: "", email: "", password: "", role: "AGENT" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create account");
    }
  }
  async function toggle(staff: Staff) {
    try {
      await api(`/users/${staff.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !staff.is_active }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update account");
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <p className="text-sm font-medium text-cyan-700">Workspace controls</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Staff administration
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Create and manage the people who keep customer requests moving.
        </p>
      </div>
      {error && (
        <div className="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      <form
        onSubmit={create}
        className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-4">
          <h2 className="font-bold text-slate-900">Add a team member</h2>
          <p className="mt-1 text-xs text-slate-400">
            They can use their temporary password to sign in immediately.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            required
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-cyan-400"
          />
          <input
            required
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-cyan-400"
          />
          <input
            required
            minLength={8}
            type="password"
            placeholder="Temporary password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-cyan-400"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="AGENT">Agent</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700">
            Create account
          </button>
        </div>
      </form>
      <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-slate-900">
            Team members{" "}
            <span className="ml-1 text-sm font-normal text-slate-400">
              {users.length}
            </span>
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {users.map((staff) => (
            <div
              key={staff.id}
              className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                  {staff.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {staff.name}
                  </p>
                  <p className="text-xs text-slate-400">{staff.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${staff.is_active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                >
                  {staff.is_active ? "ACTIVE" : "INACTIVE"}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {staff.role}
                </span>
                {staff.id !== user.id && (
                  <button
                    onClick={() => void toggle(staff)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    {staff.is_active ? "Deactivate" : "Activate"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminPage;
