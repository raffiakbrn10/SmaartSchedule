const iconMap = {
  teal: <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg>,
  orange: <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  emerald: <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
};

const colorStyles = {
  teal: "bg-red-100/80 text-red-600 dark:bg-red-950/30 dark:text-red-400",
  orange: "bg-amber-100/80 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  emerald: "bg-emerald-100/80 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
};

const borderStyles = {
  teal: "from-red-500/40",
  orange: "from-amber-500/40",
  emerald: "from-emerald-500/40",
};

export function StatsCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: "teal" | "orange" | "emerald" }) {
  return (
    <article className="glass-card glass-card-hover relative overflow-hidden p-6">
      {/* Gradient top border */}
      <div aria-hidden className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${borderStyles[color]} to-transparent`} />
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1.5 text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
          <p className="text-3xl font-extrabold tracking-tight">{value}</p>
        </div>
        <span aria-hidden className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colorStyles[color]}`}>
          {iconMap[color]}
        </span>
      </div>
    </article>
  );
}
