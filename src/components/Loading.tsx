export function Loading({ label = "Memuat..." }: { label?: string }) {
  return <div className="flex min-h-48 flex-col items-center justify-center gap-4" role="status"><span className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-emerald-500 dark:border-neutral-800 dark:border-t-cyan-500" /><span className="text-sm text-neutral-500 dark:text-neutral-400">{label}</span></div>;
}
