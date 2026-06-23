"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [{ name: "Dashboard", path: "/dashboard", icon: "📊" }, { name: "Jadwal Tugas", path: "/schedule", icon: "📝" }, { name: "Pengaturan Profil", path: "/profile", icon: "⚙️" }];

export function Sidebar({ open, onClose }: { open: boolean; onClose(): void }) {
  const pathname = usePathname();
  return <>{open && <button aria-label="Tutup menu" className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden" onClick={onClose} />}<aside aria-label="Menu aplikasi" className={`fixed bottom-0 left-0 top-16 z-40 w-64 border-r border-neutral-200/60 bg-white/90 backdrop-blur-xl transition-transform dark:border-neutral-800 dark:bg-black/80 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}><div className="flex h-full flex-col p-5"><p className="mb-4 px-3 text-xs font-bold uppercase tracking-widest text-neutral-400">Menu utama</p><nav className="flex-1 space-y-2">{items.map((item) => { const active = pathname === item.path; return <Link key={item.path} href={item.path} onClick={onClose} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 ${active ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 dark:bg-cyan-500" : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"}`}><span aria-hidden>{item.icon}</span>{item.name}</Link>; })}</nav><div className="rounded-2xl border border-neutral-200/50 bg-neutral-50 p-4 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/50">SmartSchedule v2.0</div></div></aside></>;
}
