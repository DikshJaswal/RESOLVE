import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { api, getUser, saveSession } from "../../../lib/api";
import type { Session } from "../../../lib/api";

const DEMO_USERS = [
  {
    role: "Admin",
    email: "admin@resolve.com",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    desc: "Full management & staff controls",
  },
  {
    role: "Agent",
    email: "agent@resolve.com",
    badge: "bg-cyan-100 text-cyan-800 border-cyan-200",
    desc: "Claim & reply to tickets",
  },
  {
    role: "Customer",
    email: "customer@resolve.com",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    desc: "Submit requests & view replies",
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (getUser()) return <Navigate to="/" replace />;

  async function executeLogin(loginEmail: string, loginPass: string) {
    setLoading(true);
    setError("");
    try {
      const result = await api<{ success: true } & Session>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      saveSession(result);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to login",
      );
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await executeLogin(email, password);
  }

  function handleDemoClick(demoEmail: string) {
    const demoPass = "Password123!";
    setEmail(demoEmail);
    setPassword(demoPass);
    void executeLogin(demoEmail, demoPass);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md space-y-4">
        {/* Quick Demo Access Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              ⚡ Recruiter 1-Click Demo Access
            </p>
            <span className="text-[10px] rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">
              Password: Password123!
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Click any role to test role-based access control instantly:
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {DEMO_USERS.map((demo) => (
              <button
                key={demo.role}
                type="button"
                disabled={loading}
                onClick={() => handleDemoClick(demo.email)}
                className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-xs font-semibold transition hover:shadow-sm active:scale-95 disabled:opacity-50 ${demo.badge}`}
              >
                <span>{demo.role}</span>
                <span className="mt-0.5 text-[9px] font-normal opacity-80">
                  1-Click
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Standard Login Form */}
        <form
          onSubmit={submit}
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-400 text-xs font-black text-slate-950">
              R
            </span>
            <p className="text-xs font-bold tracking-widest text-cyan-700">
              RESOLVE WORKSPACE
            </p>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Sign in
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Access your support dashboard and requests.
          </p>

          {location.state?.registered && (
            <p className="mt-4 rounded-lg bg-green-50 p-2.5 text-sm text-green-700">
              Account created. You can now sign in.
            </p>
          )}

          <label className="mt-5 block text-sm font-medium text-slate-700">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Password
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </label>

          {error && (
            <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p className="mt-5 text-center text-sm text-slate-500">
            New to RESOLVE?{" "}
            <Link to="/register" className="font-semibold text-cyan-700 hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default LoginPage;
