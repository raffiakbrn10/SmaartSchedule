"use client";

import { useEffect, useState } from "react";
import { DeadlineReminder } from "@/components/DeadlineReminder";
import { Loading } from "@/components/Loading";
import { ProgressChart } from "@/components/ProgressChart";
import { StatsCard } from "@/components/StatsCard";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import type { Schedule } from "@/types/api";

export default function DashboardPage() {
  const { user } = useAuth(); const [schedules, setSchedules] = useState<Schedule[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { api.schedules().then((result) => setSchedules(result.schedules)).catch((caught) => setError(caught instanceof ApiError ? caught.message : "Jadwal tidak dapat dimuat.")).finally(() => setLoading(false)); }, []);
  if (loading) return <Loading label="Menyelaraskan dashboard..." />;
  const completed = schedules.filter((item) => item.status === "Selesai").length; const active = schedules.filter((item) => item.status === "Sedang Berjalan").length;
  return <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-6"><header className="mb-8"><h1 className="text-2xl font-bold">Halo, {user?.username ?? "Pengguna"}! 👋</h1><p className="mt-1 text-neutral-500 dark:text-neutral-400">Berikut ringkasan aktivitas dan tugasmu.</p></header>{error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">{error}</div>}<section aria-label="Ringkasan tugas" className="grid gap-6 md:grid-cols-3"><StatsCard title="Total tugas" value={schedules.length} icon="📋" color="teal" /><StatsCard title="Sedang dikerjakan" value={active} icon="⏳" color="orange" /><StatsCard title="Selesai" value={completed} icon="✅" color="emerald" /></section><section className="grid gap-6 lg:grid-cols-2"><article className="rounded-3xl border border-neutral-200/60 bg-white/70 p-6 dark:border-neutral-800 dark:bg-neutral-900/60"><h2 className="mb-4 text-lg font-bold">Progres penyelesaian</h2><ProgressChart schedules={schedules} /></article><article className="rounded-3xl border border-neutral-200/60 bg-white/70 p-6 dark:border-neutral-800 dark:bg-neutral-900/60"><h2 className="mb-4 text-lg font-bold">Deadline terdekat</h2><DeadlineReminder schedules={schedules} /></article></section></div>;
}
