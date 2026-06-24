import type { Schedule } from "@/types/api";

export function ProgressChart({ schedules }: { schedules: Schedule[] }) {
  const total = schedules.length; const percentage = (status: Schedule["status"]) => total ? Math.round(schedules.filter((item) => item.status === status).length / total * 100) : 0;
  const rows = [
    { label: "Tugas selesai", value: percentage("Selesai"), bar: "bg-gradient-to-r from-emerald-500 to-emerald-400 dark:from-emerald-500 dark:to-emerald-400", text: "text-emerald-600 dark:text-emerald-400" },
    { label: "Sedang dikerjakan", value: percentage("Sedang Berjalan"), bar: "bg-gradient-to-r from-amber-500 to-amber-400", text: "text-amber-600 dark:text-amber-400" },
    { label: "Belum disentuh", value: percentage("Belum Selesai"), bar: "bg-gradient-to-r from-neutral-400 to-neutral-300 dark:from-neutral-600 dark:to-neutral-500", text: "text-neutral-500" },
  ];
  return (
    <div className="mt-4 space-y-6">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="mb-2.5 flex justify-between text-sm font-medium">
            <span className="text-neutral-600 dark:text-neutral-400">{row.label}</span>
            <span className={`font-bold ${row.text}`}>{row.value}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-neutral-100/80 dark:bg-white/5">
            <div className={`h-full rounded-full transition-all duration-700 ease-out ${row.bar}`} style={{ width: `${row.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
