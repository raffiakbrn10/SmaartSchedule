"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

export function useTheme(): [Theme, () => void, boolean] {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const saved = window.localStorage.getItem("theme");
    const initial: Theme = saved === "dark" || (saved !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
    setTheme(initial); document.documentElement.classList.toggle("dark", initial === "dark"); setMounted(true);
  }, []);
  const toggle = useCallback(() => setTheme((current) => { const next = current === "dark" ? "light" : "dark"; document.documentElement.classList.toggle("dark", next === "dark"); window.localStorage.setItem("theme", next); return next; }), []);
  return [theme, toggle, mounted];
}
