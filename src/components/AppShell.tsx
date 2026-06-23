"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "./Loading";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth(); const router = useRouter(); const [open, setOpen] = useState(false);
  useEffect(() => { if (!loading && !user) router.replace("/login"); }, [loading, user, router]);
  if (loading || !user) return <main className="min-h-screen bg-neutral-50 pt-20 dark:bg-black"><Loading label="Memeriksa sesi..." /></main>;
  return <div className="min-h-screen bg-neutral-50 transition-colors dark:bg-black"><Navbar onMenuClick={() => setOpen(true)} /><Sidebar open={open} onClose={() => setOpen(false)} /><main className="pt-16 transition-all lg:pl-64">{children}</main></div>;
}


