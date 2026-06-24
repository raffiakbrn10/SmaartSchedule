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
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.schedules().then((result) => setSchedules(result.schedules)).catch((caught) => setError(caught instanceof ApiError ? caught.message : "Jadwal tidak dapat dimuat.")).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading label="Menyelaraskan dashboard..." />;

  const completed = schedules.filter((item) => item.status === "Selesai").length;
  const active = schedules.filter((item) => item.status === "Sedang Berjalan").length;
  
  // Sort schedules for list view
  const sortedSchedules = [...schedules].sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline));
  
  // Fake recent activities based on schedules
  const recentActivities = sortedSchedules.slice(0, 4).map(s => ({
    id: s.id,
    title: s.judul,
    action: s.status === "Selesai" ? "Tugas diselesaikan" : s.status === "Sedang Berjalan" ? "Mulai dikerjakan" : "Tugas ditambahkan",
    time: new Intl.DateTimeFormat("id-ID", { dateStyle: "short", timeStyle: "short" }).format(new Date(s.deadline)),
    isCompleted: s.status === "Selesai"
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
      {/* Header Section */}
      <header className="mb-10 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 dark:from-white dark:to-neutral-400">
          Halo, {user?.displayName || user?.username?.split("@")[0]}! 👋
        </h1>
        <p className="mt-3 text-base text-neutral-500 dark:text-neutral-400">
          Pantau progres hari ini dan tetap terorganisir.
        </p>
      </header>

      {error && <div role="alert" className="glass-card border-red-200/60 dark:border-red-900/30 bg-red-50/60 dark:bg-red-950/20 p-4 text-sm font-medium text-red-700 dark:text-red-400">{error}</div>}

      {/* Stats Row */}
      <section aria-label="Ringkasan tugas" className="grid gap-6 md:grid-cols-3">
        <StatsCard title="Total tugas" value={schedules.length} icon="tasks" color="teal" />
        <StatsCard title="Sedang dikerjakan" value={active} icon="progress" color="orange" />
        <StatsCard title="Selesai" value={completed} icon="done" color="emerald" />
      </section>

      {/* Main Content Layout (CSS Grid) */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (Large): Task Schedule List */}
        <div className="lg:col-span-2 space-y-6">
          <article className="glass-card p-6 sm:p-8 h-full">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold">Daftar Tugas</h2>
              <span className="rounded-full bg-red-100/80 px-3 py-1 text-xs font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-400">{schedules.length} tugas</span>
            </div>
            
            <div className="space-y-4">
              {sortedSchedules.length === 0 ? (
                <div className="py-8 text-center text-sm text-neutral-500">Belum ada tugas.</div>
              ) : (
                sortedSchedules.map((schedule) => (
                  <div key={schedule.id} className="group relative flex items-center gap-4 rounded-2xl border border-neutral-200/50 bg-white/40 p-4 transition-all duration-300 hover:scale-[1.01] hover:bg-white/60 hover:shadow-lg hover:shadow-red-500/5 dark:border-white/5 dark:bg-black/20 dark:hover:bg-white/5">
                    <div className={`h-3 w-3 shrink-0 rounded-full ${schedule.status === 'Selesai' ? 'bg-emerald-500' : schedule.prioritas === 'Tinggi' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-amber-500'}`} />
                    <div className="flex-1 min-w-0">
                      <h3 className={`truncate font-semibold ${schedule.status === 'Selesai' ? 'line-through text-neutral-400 dark:text-neutral-500' : 'text-neutral-800 dark:text-neutral-200'}`}>{schedule.judul}</h3>
                      <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                          {new Intl.DateTimeFormat("id-ID", { dateStyle: "short", timeStyle: "short" }).format(new Date(schedule.deadline))}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md font-medium border ${schedule.prioritas === 'Tinggi' ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400' : schedule.prioritas === 'Medium' ? 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-400' : 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:text-emerald-400'}`}>
                          {schedule.prioritas}
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${schedule.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : schedule.status === 'Sedang Berjalan' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' : 'bg-neutral-100 text-neutral-600 dark:bg-white/5 dark:text-neutral-400'}`}>{schedule.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="lg:col-span-1 space-y-6">
          <article className="glass-card p-6">
            <h2 className="mb-4 text-lg font-bold">Progres Tugas</h2>
            <ProgressChart schedules={schedules} />
          </article>
          <article className="glass-card p-6">
            <h2 className="mb-4 text-lg font-bold">Deadline Terdekat</h2>
            <DeadlineReminder schedules={schedules} />
          </article>
        </div>
      </section>

      {/* Bottom Section: Aktivitas Terkini */}
      <section>
        <article className="glass-card p-6 sm:p-8">
          <h2 className="mb-6 text-lg font-bold">Aktivitas Terkini</h2>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
               <p className="text-sm text-neutral-500">Belum ada aktivitas tercatat.</p>
            ) : (
              recentActivities.map((act, i) => (
                <div key={`${act.id}-${i}`} className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-white/40 p-4 transition-all hover:bg-white/60 dark:border-white/5 dark:bg-black/20 dark:hover:bg-white/5">
                  <div className={`flex h-2.5 w-2.5 shrink-0 rounded-full ${act.isCompleted ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse'}`} />
                  <div className="flex flex-1 flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{act.action}</p>
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-0.5">{act.title}</p>
                    </div>
                    <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">{act.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
