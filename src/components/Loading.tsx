export function Loading({ label = "Memuat..." }: { label?: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-4" role="status">
      <div className="relative h-10 w-10">
        <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-neutral-200/50 border-t-red-600 dark:border-white/10 dark:border-t-white" />
        <span className="absolute inset-1 rounded-full bg-gradient-to-br from-red-600/10 to-transparent dark:from-white/5 animate-pulse" />
      </div>
      <span className="text-sm font-medium text-neutral-400 dark:text-neutral-500">{label}</span>
    </div>
  );
}
