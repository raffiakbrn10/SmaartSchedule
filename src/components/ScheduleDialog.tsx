"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { scheduleSchema } from "@/lib/scheduleSchema";
import type { Schedule, ScheduleInput } from "@/types/api";

const blank: ScheduleInput = { judul: "", prioritas: "Medium", status: "Belum Selesai", deadline: "" };
function localDateTime(value: string): string { const date = new Date(value); const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000); return shifted.toISOString().slice(0, 16); }

export function ScheduleDialog({ schedule, open, saving, onClose, onSave }: { schedule: Schedule | null; open: boolean; saving: boolean; onClose(): void; onSave(input: ScheduleInput): Promise<void> }) {
  const [form, setForm] = useState<ScheduleInput>(blank); const [error, setError] = useState(""); const firstInput = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) { setForm(schedule ? { judul: schedule.judul, prioritas: schedule.prioritas, status: schedule.status, deadline: localDateTime(schedule.deadline) } : blank); setError(""); setTimeout(() => firstInput.current?.focus(), 0); } }, [open, schedule]);
  if (!open) return null;
  async function submit(event: FormEvent) { event.preventDefault(); const result = scheduleSchema.safeParse(form); if (!result.success) { setError(result.error.issues[0]?.message ?? "Data tidak valid."); return; } await onSave({ ...result.data, deadline: new Date(result.data.deadline).toISOString() }); }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-md" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="glass-card w-full max-w-md p-6 sm:p-8 shadow-2xl animate-fade-in-up border border-white/20 dark:border-white/10">
        <div className="flex items-center justify-between">
          <h2 id="dialog-title" className="text-xl font-bold">{schedule ? "Edit tugas" : "Tambah tugas baru"}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup dialog" className="rounded-xl p-2 text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50/80 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400 border border-red-200/40 dark:border-red-900/30">{error}</p>}

        <form onSubmit={(e) => { void submit(e); }} className="mt-5 space-y-4">
          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-semibold text-neutral-600 dark:text-neutral-400">Judul tugas</label>
            <input ref={firstInput} id="title" required maxLength={200} value={form.judul} onChange={(event) => setForm({ ...form, judul: event.target.value })} className="input-glass" placeholder="Masukkan judul tugas" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="mb-1.5 block text-sm font-semibold text-neutral-600 dark:text-neutral-400">Prioritas</label>
              <select id="priority" value={form.prioritas} onChange={(event) => setForm({ ...form, prioritas: event.target.value as ScheduleInput["prioritas"] })} className="input-glass">
                {["Rendah", "Medium", "Tinggi"].map((value) => <option key={value}>{value}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="mb-1.5 block text-sm font-semibold text-neutral-600 dark:text-neutral-400">Status</label>
              <select id="status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ScheduleInput["status"] })} className="input-glass">
                {["Belum Selesai", "Sedang Berjalan", "Selesai"].map((value) => <option key={value}>{value}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="deadline" className="mb-1.5 block text-sm font-semibold text-neutral-600 dark:text-neutral-400">Deadline</label>
            <input id="deadline" type="datetime-local" required value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} className="input-glass" />
          </div>
          <div className="flex gap-3 border-t border-neutral-200/40 dark:border-white/5 pt-5">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 py-2.5 text-sm">Batal</button>
            <button disabled={saving} className="btn-primary flex-1 py-2.5 text-sm">{saving ? "Menyimpan..." : "Simpan"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
