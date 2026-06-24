"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import type { IntegrationStatus } from "@/types/api";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<IntegrationStatus>({ googleLinked: false, telegramLinked: false });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "success" | "error">("info");
  const [busy, setBusy] = useState<"google" | "logout" | "profile" | null>(null);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState("");

  useEffect(() => {
    if (user?.displayName) {
      setDisplayNameInput(user.displayName);
    }
  }, [user]);

  const fetchStatus = useCallback(() => {
    api.integrationStatus().then(setStatus).catch((caught) =>
      setMessage(caught instanceof ApiError ? caught.message : "Status integrasi tidak dapat dimuat.")
    );
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  useEffect(() => {
    const linked = params.get("google_linked");
    if (linked === "success") {
      setMessage("Google Calendar berhasil ditautkan.");
      setMessageType("success");
    } else if (linked === "failed") {
      setMessage("Google Calendar gagal ditautkan.");
      setMessageType("error");
    }
  }, [params]);

  async function connectGoogle() {
    setBusy("google");
    setMessage("");
    try {
      const { url } = await api.googleAuthUrl();
      window.location.assign(url);
    } catch (caught) {
      setMessage(caught instanceof ApiError ? caught.message : "URL Google tidak dapat dibuat.");
      setMessageType("error");
      setBusy(null);
    }
  }

  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault();
    setBusy("profile");
    setMessage("");
    try {
      await api.updateProfile({ displayName: displayNameInput });
      setMessage("Nama panggilan berhasil diperbarui. Halaman akan dimuat ulang.");
      setMessageType("success");
      setIsEditingProfile(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch (caught) {
      setMessage(caught instanceof ApiError ? caught.message : "Gagal memperbarui profil.");
      setMessageType("error");
    } finally {
      setBusy(null);
    }
  }

  async function signOut() {
    setBusy("logout");
    await logout();
    router.replace("/login");
  }

  const messageStyles = {
    info: "border-amber-200/60 bg-amber-50/60 text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400",
    success: "border-emerald-200/60 bg-emerald-50/60 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400",
    error: "border-red-200/60 bg-red-50/60 text-red-800 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400",
  };

  const displayName = user?.displayName || user?.username.split('@')[0] || "Pengguna";

  return (
    <div className="mx-auto max-w-3xl p-5 sm:p-8">
      <h1 className="mb-6 text-2xl font-extrabold sm:text-3xl animate-fade-in-up">Pengaturan profil</h1>
      <div className="glass-card space-y-8 p-6 sm:p-10">
        {/* User Info */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div aria-hidden className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-3xl font-extrabold text-white shadow-lg shadow-red-600/20 dark:from-white/90 dark:to-white/70 dark:text-[#0a0000] dark:shadow-white/10">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold">{displayName}</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{user?.username}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Sesi terverifikasi
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="btn-ghost text-sm px-4 py-2"
          >
            {isEditingProfile ? "Batal Edit" : "Ubah Nama"}
          </button>
        </section>

        {isEditingProfile && (
          <form onSubmit={handleUpdateProfile} className="glass-card p-5 border border-neutral-200/50 dark:border-white/10 flex flex-col sm:flex-row items-end gap-4 animate-fade-in-up">
            <div className="flex flex-col gap-2 flex-1 w-full">
              <label htmlFor="displayName" className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Nama Panggilan Baru</label>
              <input
                id="displayName"
                type="text"
                required
                value={displayNameInput}
                onChange={(e) => setDisplayNameInput(e.target.value)}
                disabled={busy !== null}
                className="input-glass focus:ring-1 focus:ring-red-500/50"
                placeholder="Misal: Budi"
              />
            </div>
            <button
              type="submit"
              disabled={busy !== null}
              className="btn-primary py-2.5 px-6 w-full sm:w-auto"
            >
              {busy === "profile" ? "Menyimpan..." : "Simpan"}
            </button>
          </form>
        )}

        {/* Status Message */}
        {message && (
          <div role="status" className={`rounded-xl border p-3.5 text-sm font-medium backdrop-blur-sm ${messageStyles[messageType]}`}>
            {message}
          </div>
        )}

        {/* Google Calendar Integration */}
        <section className="border-t border-neutral-200/40 dark:border-white/5 pt-8">
          <h2 className="text-lg font-bold">Integrasi layanan</h2>
          <p className="mb-5 mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">Sinkronkan tugas ke kalender untuk kemudahan akses.</p>
          <article className="glass-card flex flex-col justify-between gap-5 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100/80 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
              </div>
              <div>
                <h3 className="font-semibold">Google Calendar</h3>
                <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">Jadwal baru otomatis ditambahkan ke kalender pribadimu.</p>
              </div>
            </div>
            <button
              disabled={busy !== null}
              onClick={() => void connectGoogle()}
              className={`w-full rounded-xl py-3 text-sm font-bold transition-all disabled:opacity-50 ${status.googleLinked ? "btn-ghost" : "btn-primary"}`}
            >
              {busy === "google" ? "Membuka Google..." : status.googleLinked ? "Google terhubung (ganti akun)" : "Tautkan Google Calendar"}
            </button>
          </article>
        </section>

        {/* Logout */}
        <section className="border-t border-neutral-200/40 dark:border-white/5 pt-8">
          <button
            disabled={busy !== null}
            onClick={() => void signOut()}
            className="rounded-xl border border-red-200/60 bg-red-50/60 px-6 py-3 text-sm font-semibold text-red-600 transition-all hover:bg-red-100/60 hover:border-red-300/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 disabled:opacity-50 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            {busy === "logout" ? "Keluar..." : "Keluar aplikasi"}
          </button>
        </section>
      </div>
    </div>
  );
}
