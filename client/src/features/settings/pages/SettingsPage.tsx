import { useState } from "react";
import type { FormEvent } from "react";
import { api, getUser } from "../../../lib/api";

function SettingsPage() {
  const user = getUser();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const result = await api<{ message: string }>("/me/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setMessage(result.message);
      setCurrentPassword("");
      setNewPassword("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to change password");
    }
  }
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-medium text-cyan-700">Your account</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
        Settings
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Manage your profile and account security.
      </p>
      <div className="mt-7 grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-2xl bg-[#101827] p-6 text-white shadow-lg">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400 text-xl font-bold text-slate-950">
            {user?.name.slice(0, 1).toUpperCase()}
          </div>
          <h2 className="mt-5 text-xl font-bold">{user?.name}</h2>
          <p className="mt-1 text-sm text-slate-400">{user?.email}</p>
          <span className="mt-5 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold capitalize text-cyan-300">
            {user?.role.toLowerCase()}
          </span>
        </section>
        <form
          onSubmit={submit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="font-bold text-slate-900">Change password</h2>
          <p className="mt-1 text-sm text-slate-500">
            Use a strong password you do not reuse elsewhere.
          </p>
          <label className="mt-6 block text-sm font-semibold text-slate-700">
            Current password
            <input
              required
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-cyan-400"
            />
          </label>
          <label className="mt-4 block text-sm font-semibold text-slate-700">
            New password
            <input
              required
              minLength={8}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-cyan-400"
            />
          </label>
          {message && (
            <p className="mt-4 text-sm text-emerald-600">{message}</p>
          )}
          {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
          <button className="mt-5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700">
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}

export default SettingsPage;
