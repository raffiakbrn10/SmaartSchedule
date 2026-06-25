"use client";

import { useCallback, useEffect, useState } from "react";
import { Loading } from "@/components/Loading";
import { ScheduleCard } from "@/components/ScheduleCard";
import { ScheduleDialog } from "@/components/ScheduleDialog";
import { api, ApiError } from "@/lib/api";
import type { Schedule, ScheduleInput } from "@/types/api";

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [selected, setSelected] = useState<Schedule | null>(null); const [dialogOpen, setDialogOpen] = useState(false); const [error, setError] = useState(""); const [filter, setFilter] = useState<"Semua" | "Selesai" | "Belum Selesai">("Semua");
  const load = useCallback(async () => { try { const result = await api.schedules(); setSchedules(result.schedules); setError(""); } catch (caught) { setError(caught instanceof ApiError ? caught.message : "Jadwal tidak dapat dimuat."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  async function save(input: ScheduleInput) { setSaving(true); setError(""); try { if (selected) await api.updateSchedule(selected.id, input); else await api.createSchedule(input); setDialogOpen(false); await load(); } catch (caught) { setError(caught instanceof ApiError ? caught.message : "Jadwal gagal disimpan."); } finally { setSaving(false); } }
  async function remove(schedule: Schedule) { if (!window.confirm(`Hapus tugas "${schedule.judul}"?`)) return; try { await api.deleteSchedule(schedule.id); await load(); } catch (caught) { setError(caught instanceof ApiError ? caught.message : "Jadwal gagal dihapus."); } }
  async function toggleStatus(schedule: Schedule) {
    try {
      const newStatus = schedule.status === "Selesai" ? "Belum Selesai" : "Selesai";
      setSchedules(prev => prev.map(s => s.id === schedule.id ? { ...s, status: newStatus } : s));
      await api.updateSchedule(schedule.id, { 
        judul: schedule.judul, prioritas: schedule.prioritas, kategori: schedule.kategori, deadline: schedule.deadline, 
        status: newStatus 
      });
      await load();
    } catch (e) {
      setError("Gagal merubah status tugas.");
      await load(); // revert
    }
  }

  if (loading) return <Loading label="Memuat jadwal..." />;

  const filteredSchedules = filter === "Semua" ? schedules : schedules.filter(s => s.status === filter);

  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-8">
      <header className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Jadwal</h1>
          <p className="mt-1 text-neutral-500 dark:text-neutral-400">Kelola dan pantau semua tugasmu di sini.</p>
        </div>
        <button onClick={() => { setSelected(null); setDialogOpen(true); }} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Tambah tugas
        </button>
      </header>

      {error && <div role="alert" className="mb-6 glass-card border-red-200/60 dark:border-red-900/30 bg-red-50/60 dark:bg-red-950/20 p-4 text-sm font-medium text-red-700 dark:text-red-400">{error}</div>}

      {/* Navigation Bar Filter */}
      <nav className="mb-6 flex gap-2 border-b border-neutral-200/60 dark:border-white/10 pb-4 overflow-x-auto">
        {(["Semua", "Belum Selesai", "Selesai"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f ? 'bg-red-600 text-white shadow-md shadow-red-600/20 dark:bg-red-600 dark:text-white' : 'bg-transparent text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-neutral-200'}`}>{f}</button>
        ))}
      </nav>

      <section aria-label="Daftar tugas" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredSchedules.map((item) => <ScheduleCard key={item.id} schedule={item} onEdit={() => { setSelected(item); setDialogOpen(true); }} onDelete={() => void remove(item)} onToggleStatus={() => void toggleStatus(item)} />)}
        {!filteredSchedules.length && (
          <div className="col-span-full glass-card flex flex-col items-center justify-center py-16 text-center">
            <svg className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-4" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium">Belum ada jadwal tugas.</p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Tambahkan tugas pertamamu.</p>
          </div>
        )}
      </section>
      <ScheduleDialog open={dialogOpen} schedule={selected} saving={saving} onClose={() => setDialogOpen(false)} onSave={save} />
      
      {/* Mobile FAB */}
      <button 
        onClick={() => { setSelected(null); setDialogOpen(true); }}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-800 text-white shadow-xl shadow-red-600/30 transition-transform active:scale-95 md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
        aria-label="Tambah tugas"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
      </button>
    </div>
  );
}
