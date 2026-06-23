"use client";

import { useCallback, useEffect, useState } from "react";
import { Loading } from "@/components/Loading";
import { ScheduleCard } from "@/components/ScheduleCard";
import { ScheduleDialog } from "@/components/ScheduleDialog";
import { api, ApiError } from "@/lib/api";
import type { Schedule, ScheduleInput } from "@/types/api";

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [selected, setSelected] = useState<Schedule | null>(null); const [dialogOpen, setDialogOpen] = useState(false); const [error, setError] = useState("");
  const load = useCallback(async () => { try { const result = await api.schedules(); setSchedules(result.schedules); setError(""); } catch (caught) { setError(caught instanceof ApiError ? caught.message : "Jadwal tidak dapat dimuat."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  async function save(input: ScheduleInput) { setSaving(true); setError(""); try { if (selected) await api.updateSchedule(selected.id, input); else await api.createSchedule(input); setDialogOpen(false); await load(); } catch (caught) { setError(caught instanceof ApiError ? caught.message : "Jadwal gagal disimpan."); } finally { setSaving(false); } }
  async function remove(schedule: Schedule) { if (!window.confirm(`Hapus tugas “${schedule.judul}”?`)) return; try { await api.deleteSchedule(schedule.id); await load(); } catch (caught) { setError(caught instanceof ApiError ? caught.message : "Jadwal gagal dihapus."); } }
  if (loading) return <Loading label="Memuat jadwal..." />;
  return <div className="mx-auto max-w-7xl p-5 sm:p-6"><header className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-2xl font-bold">Jadwal tugas</h1><p className="text-neutral-500 dark:text-neutral-400">Kelola dan pantau semua tugasmu di sini.</p></div><button onClick={() => { setSelected(null); setDialogOpen(true); }} className="rounded-xl bg-emerald-500 px-5 py-2.5 font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:bg-cyan-600">+ Tambah tugas</button></header>{error && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">{error}</div>}<section aria-label="Daftar tugas" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{schedules.map((item) => <ScheduleCard key={item.id} schedule={item} onEdit={() => { setSelected(item); setDialogOpen(true); }} onDelete={() => void remove(item)} />)}{!schedules.length && <div className="col-span-full rounded-3xl border border-dashed border-neutral-300 bg-white/50 py-12 text-center text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/30">Belum ada jadwal tugas. Tambahkan tugas pertamamu.</div>}</section><ScheduleDialog open={dialogOpen} schedule={selected} saving={saving} onClose={() => setDialogOpen(false)} onSave={save} /></div>;
}
