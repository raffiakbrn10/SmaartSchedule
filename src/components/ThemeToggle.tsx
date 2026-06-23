"use client";

import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const [theme, toggle, mounted] = useTheme();
  return <button type="button" onClick={toggle} aria-label={theme === "dark" ? "Gunakan tema terang" : "Gunakan tema gelap"} className="rounded-xl border border-neutral-200 bg-white p-2.5 text-lg transition hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800">{mounted && theme === "dark" ? "☀️" : "🌙"}</button>;
}
