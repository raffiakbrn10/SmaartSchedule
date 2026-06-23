import type { ApiResponse, IntegrationStatus, Schedule, ScheduleInput, User } from "@/types/api";
import { supabase } from "@/lib/supabase";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly errors?: Record<string, string[]>) { super(message); this.name = "ApiError"; }
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}${path}`, { ...init, credentials: "include", headers });
  const body = await response.json() as ApiResponse<T>;

  if (!response.ok || !body.success) throw new ApiError(body.message || "Permintaan gagal.", response.status, body.errors);
  if (body.data === undefined) return undefined as T;
  return body.data;
}

export const api = {
  register: (credentials: { username: string; password: string }) => apiRequest<{ user: User }>("/auth/register", { method: "POST", body: JSON.stringify(credentials) }),
  login: (credentials: { username: string; password: string }) => apiRequest<{ user: User }>("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  logout: () => apiRequest<void>("/auth/logout", { method: "POST" }),
  me: () => apiRequest<{ user: User }>("/auth/me"),
  schedules: () => apiRequest<{ schedules: Schedule[] }>("/schedules"),
  createSchedule: (input: ScheduleInput) => apiRequest<{ id: number }>("/schedules", { method: "POST", body: JSON.stringify(input) }),
  updateSchedule: (id: number, input: ScheduleInput) => apiRequest<void>(`/schedules/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteSchedule: (id: number) => apiRequest<void>(`/schedules/${id}`, { method: "DELETE" }),
  integrationStatus: () => apiRequest<IntegrationStatus>("/integrations/status"),
  googleAuthUrl: () => apiRequest<{ url: string }>("/google/auth-url"),
  telegramLink: () => apiRequest<{ url: string }>("/integrations/telegram/link"),
};
