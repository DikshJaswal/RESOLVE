const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "CUSTOMER" | "AGENT" | "ADMIN";
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category_name: string;
  customer_name: string;
  agent_name: string | null;
  created_at?: string;
  updated_at?: string;
}

async function request<T>(
  path: string,
  options: RequestInit,
  retryRefresh: boolean,
): Promise<T & { message?: string }> {
  const token = localStorage.getItem("resolve_access_token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = (await response.json()) as T & { message?: string };

  if (
    response.status === 401 &&
    retryRefresh &&
    path !== "/auth/refresh-token"
  ) {
    const refreshToken = localStorage.getItem("resolve_refresh_token");
    if (refreshToken) {
      try {
        const refreshed = await request<{
          accessToken: string;
          refreshToken: string;
        }>(
          "/auth/refresh-token",
          { method: "POST", body: JSON.stringify({ refreshToken }) },
          false,
        );
        localStorage.setItem("resolve_access_token", refreshed.accessToken);
        localStorage.setItem("resolve_refresh_token", refreshed.refreshToken);
        return request<T>(path, options, false);
      } catch {
        clearSession();
      }
    }
  }

  if (!response.ok) throw new Error(data.message ?? "Request failed");
  return data;
}

export function api<T>(path: string, options: RequestInit = {}) {
  return request<T>(path, options, true);
}

export function saveSession(session: Session) {
  localStorage.setItem("resolve_access_token", session.accessToken);
  localStorage.setItem("resolve_refresh_token", session.refreshToken);
  localStorage.setItem("resolve_user", JSON.stringify(session.user));
}

export function getUser(): User | null {
  const value = localStorage.getItem("resolve_user");
  return value ? (JSON.parse(value) as User) : null;
}

export function clearSession() {
  localStorage.removeItem("resolve_access_token");
  localStorage.removeItem("resolve_refresh_token");
  localStorage.removeItem("resolve_user");
}
