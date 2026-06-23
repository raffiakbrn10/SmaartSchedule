import type { Schedule } from "@/types/api";

export function ProgressChart({ schedules }: { schedules: Schedule[] }) {
  const total = schedules.length; const percentage = (status: Schedule["status"]) => total ? Math.round(schedules.filter((item) => item.status === status).length / total * 100) : 0;
  const rows = [{ label: "Tugas selesai", value: percentage("Selesai"), bar: "bg-emerald-500 dark:bg-cyan-500", text: "text-emerald-600 dark:text-cyan-400" }, { label: "Sedang dikerjakan", value: percentage("Sedang Berjalan"), bar: "bg-yellow-400", text: "text-yellow-600 dark:text-yellow-400" }, { label: "Belum disentuh", value: percentage("Belum Selesai"), bar: "bg-neutral-400", text: "text-neutral-500" }];
  return <div className="mt-4 space-y-6">{rows.map((row) => <div key={row.label}><div className="mb-2 flex justify-between text-sm font-medium"><span className="text-neutral-600 dark:text-neutral-400">{row.label}</span><span className={`font-bold ${row.text}`}>{row.value}%</span></div><div className="h-4 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"><div className={`h-full transition-all duration-700 ${row.bar}`} style={{ width: `${row.value}%` }} /></div></div>)}</div>;
}
