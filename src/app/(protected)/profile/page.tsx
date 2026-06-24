"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [busy, setBusy] = useState<"google" | "telegram" | "logout" | null>(null);
  const waitingForTelegram = useRef(false);

  const fetchStatus = useCallback(() => {
    api.integrationStatus().then((newStatus) => {
      setStatus((prev) => {
        // Detect when telegram just got linked
        if (!prev.telegramLinked && newStatus.telegramLinked && waitingForTelegram.current) {
          waitingForTelegram.current = false;
          setMessage("Bot Telegram berhasil diaktifkan! 🎉");
          setMessageType("success");
        }
        return newStatus;
      });
    }).catch((caught) =>
      setMessage(caught instanceof ApiError ? caught.message : "Status integrasi tidak dapat dimuat.")
    );
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  // Auto-refresh status when user returns to the page (e.g. coming back from Telegram app)
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchStatus();
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchStatus]);

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

  async function connectTelegram() {
    setBusy("telegram");
    setMessage("");
    try {
      const { url } = await api.telegramLink();
      waitingForTelegram.current = true;

      // Gunakan window.open untuk membuka di tab baru
      // Catatan: terkadang bisa diblokir oleh popup blocker di browser mobile karena dipanggil setelah async await.
      window.open(url, "_blank");
      
      // Reset state busy setelah tab baru terbuka agar tombol tidak terus menerus loading
      setTimeout(() => setBusy(null), 1000);
    } catch (caught) {
      setMessage(caught instanceof ApiError ? caught.message : "Tautan Telegram tidak dapat dibuat.");
      setMessageType("error");
      setBusy(null);
    }
  }

  async function signOut() {
    setBusy("logout");
    await logout();
    router.replace("/login");
  }

  const messageStyles = {
    info: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-400",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-400",
    error: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400",
  };

  return (
    <div className="mx-auto max-w-3xl p-5 sm:p-6">
      <h1 className="mb-6 text-2xl font-bold">Pengaturan profil</h1>
      <div className="space-y-8 rounded-3xl border border-neutral-200/60 bg-white/70 p-6 shadow-xl backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/60 sm:p-8">
        {/* User Info */}
        <section className="flex items-center gap-5">
          <div aria-hidden className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-3xl font-bold text-emerald-600 dark:bg-cyan-900/50 dark:text-cyan-400">
            {user?.username.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold">{user?.username ?? "Pengguna"}</h2>
            <p className="text-sm text-neutral-500">Akun SmartSchedule</p>
            <span className="mt-2 inline-block rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-cyan-950/50 dark:text-cyan-400">
              Sesi terverifikasi
            </span>
          </div>
        </section>

        {/* Status Message */}
        {message && (
          <div role="status" className={`rounded-xl border p-3 text-sm ${messageStyles[messageType]}`}>
            {message}
          </div>
        )}

        {/* Integrations */}
        <section className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <h2 className="text-lg font-bold">Integrasi layanan</h2>
          <p className="mb-4 mt-1 text-sm text-neutral-500">Sinkronkan tugas ke kalender dan aktifkan pengingat deadline.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Google Calendar Card */}
            <article className="flex flex-col justify-between gap-5 rounded-2xl border border-neutral-200 bg-neutral-100/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
              <div>
                <h3 className="font-semibold">📅 Google Calendar</h3>
                <p className="mt-1 text-xs leading-5 text-neutral-500">Jadwal baru otomatis ditambahkan ke kalender pribadimu.</p>
              </div>
              <button
                disabled={busy !== null}
                onClick={() => void connectGoogle()}
                className={`w-full rounded-xl py-2.5 text-xs font-bold transition disabled:opacity-60 ${status.googleLinked ? "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300" : "bg-emerald-500 text-white hover:bg-emerald-600"}`}
              >
                {busy === "google" ? "Membuka Google..." : status.googleLinked ? "Google terhubung (ganti akun)" : "Tautkan Google"}
              </button>
            </article>

            {/* Telegram Card */}
            <article className="flex flex-col justify-between gap-5 rounded-2xl border border-neutral-200 bg-neutral-100/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
              <div>
                <h3 className="font-semibold">✈️ Telegram Reminder</h3>
                <p className="mt-1 text-xs leading-5 text-neutral-500">Dapatkan pengingat deadline langsung di chat Telegram.</p>
              </div>
              {status.telegramLinked ? (
                <div className="space-y-2">
                  <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-100 py-2.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <span>✅</span> Bot Telegram Aktif
                  </div>
                  <button
                    disabled={busy !== null}
                    onClick={() => void connectTelegram()}
                    className="w-full rounded-lg py-1.5 text-[11px] text-neutral-400 transition hover:text-neutral-600 hover:underline disabled:opacity-60 dark:text-neutral-500 dark:hover:text-neutral-300"
                  >
                    Tautkan ulang
                  </button>
                </div>
              ) : (
                <button
                  disabled={busy !== null}
                  onClick={() => void connectTelegram()}
                  className="w-full rounded-xl bg-sky-500 py-2.5 text-xs font-bold text-white transition hover:bg-sky-600 disabled:opacity-60"
                >
                  {busy === "telegram" ? "Mengarahkan ke Telegram..." : "Mulai bot Telegram"}
                </button>
              )}
            </article>
          </div>
        </section>

        {/* Logout */}
        <section className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <button
            disabled={busy !== null}
            onClick={() => void signOut()}
            className="rounded-xl border border-red-200 bg-red-50 px-6 py-3 text-sm font-medium text-red-600 transition hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 disabled:opacity-60 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
          >
            {busy === "logout" ? "Keluar..." : "Keluar aplikasi"}
          </button>
        </section>
      </div>
    </div>
  );
}
