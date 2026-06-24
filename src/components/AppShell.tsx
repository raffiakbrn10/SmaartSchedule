"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "./Loading";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth(); const router = useRouter(); const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!loading && !user) {
      const isOAuth = window.location.hash.includes("access_token=") || window.location.search.includes("code=");
      if (!isOAuth) {
        router.replace("/login");
      }
    }
  }, [loading, user, router]);
  if (loading || !user) return <main className="min-h-screen bg-[#fafafa] dark:bg-[#0a0000] pt-20"><Loading label="Memeriksa sesi..." /></main>;
  return (
    <div className="bg-dynamic min-h-screen bg-[#fafafa] dark:bg-[#0a0000] transition-colors">
      <Navbar onMenuClick={() => setOpen(true)} />
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <main className="relative z-10 pt-16 transition-all">{children}</main>
    </div>
  );
}
