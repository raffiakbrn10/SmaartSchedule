import type { Schedule } from "@/types/api";

export function DeadlineReminder({ schedules, now = new Date() }: { schedules: Schedule[]; now?: Date }) {
  const upcoming = schedules.filter((item) => item.status !== "Selesai" && new Date(item.deadline) > now).sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline)).slice(0, 4);
  if (!upcoming.length) return (
    <div className="glass-card flex flex-col items-center justify-center py-10 text-center">
      <svg className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mb-3" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
      <p className="text-sm text-neutral-400 dark:text-neutral-500">Tidak ada deadline mendatang.</p>
    </div>
  );
  return (
    <div className="space-y-3">
      {upcoming.map((item) => {
        const ms = +new Date(item.deadline) - +now;
        const hours = Math.floor(ms / 3_600_000);
        const days = Math.ceil(ms / 86_400_000);
        const urgent = days <= 7;
        const remaining = hours < 1 ? `${Math.max(1, Math.floor(ms / 60_000))} menit lagi` : hours < 24 ? `${hours} jam lagi` : `${days} hari lagi`;
        return (
          <article key={item.id} className="glass-card flex items-start gap-4 p-4 transition-all duration-300 hover:scale-[1.01]">
            <span aria-hidden className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${urgent ? "animate-pulse bg-red-500 shadow-lg shadow-red-500/40" : "bg-emerald-500 dark:bg-emerald-400"}`} />
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">{item.judul}</h3>
              <p className={`mt-1 text-xs font-medium ${urgent ? "text-red-500 dark:text-red-400" : "text-neutral-500 dark:text-neutral-400"}`}>{remaining}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
