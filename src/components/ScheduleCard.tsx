import type { Schedule } from "@/types/api";

export function ScheduleCard({ schedule, onEdit, onDelete, onToggleStatus }: { schedule: Schedule; onEdit(): void; onDelete(): void; onToggleStatus(): void }) {
  const priorityStyles = {
    Tinggi: "border-red-300/60 bg-red-100/60 text-red-600 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-400",
    Medium: "border-amber-300/60 bg-amber-100/60 text-amber-600 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400",
    Rendah: "border-emerald-300/60 bg-emerald-100/60 text-emerald-600 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-400",
  }[schedule.prioritas];

  return (
    <article className="glass-card glass-card-hover glow-border relative flex h-full flex-col overflow-hidden p-6">
      {/* Top gradient bar */}
      <div aria-hidden className={`absolute inset-x-0 top-0 h-[2px] ${schedule.status === "Selesai" ? "bg-neutral-300 dark:bg-neutral-700" : "bg-gradient-to-r from-red-500 to-red-400 dark:from-red-500 dark:to-red-400"}`} />

      <div className="mb-4 mt-2 flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-lg border px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${priorityStyles}`}>{schedule.prioritas}</span>
          <span className="rounded-lg border border-neutral-200/60 bg-white/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 backdrop-blur-sm">{schedule.kategori || "Tugas"}</span>
        </div>
        <button type="button" onClick={onToggleStatus} className={`rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${schedule.status === "Selesai" ? "bg-emerald-100 text-emerald-700 shadow-sm dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-red-500 text-white shadow-md shadow-red-500/20 dark:bg-red-600"}`}>{schedule.status}</button>
      </div>

      <h2 className="mb-5 line-clamp-2 text-lg font-bold tracking-tight">{schedule.judul}</h2>

      <div className="mt-auto flex items-end justify-between gap-4 border-t border-neutral-200/40 pt-5 dark:border-white/5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Deadline</p>
          <time dateTime={schedule.deadline} className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(schedule.deadline))}
          </time>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onEdit} aria-label={`Edit ${schedule.judul}`} className="rounded-xl bg-neutral-100/80 p-2.5 text-neutral-600 transition-all hover:bg-red-100 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-red-950/40 dark:hover:text-red-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>
          </button>
          <button type="button" onClick={onDelete} aria-label={`Hapus ${schedule.judul}`} className="rounded-xl bg-neutral-100/80 p-2.5 text-neutral-600 transition-all hover:bg-red-100 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-red-950/40 dark:hover:text-red-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
          </button>
        </div>
      </div>
    </article>
  );
}
