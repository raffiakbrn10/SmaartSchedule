"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import logoLight from "@/images/Logo-Light.png";
import logoDark from "@/images/Logo-Dark.png";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const auth = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!auth.loading && auth.user) router.replace("/dashboard");
  }, [auth.loading, auth.user, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (mode === "login") {
        await auth.login({ username, password });
        router.replace("/dashboard");
      } else {
        // Send displayName when registering
        await auth.register({ username, password, displayName });
        router.replace("/login?registered=success");
      }
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Email atau password salah.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleLogin(e: React.MouseEvent) {
    e.preventDefault();
    setError("");
    try {
      const { error: oAuthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (oAuthError) {
        setError(oAuthError.message);
      }
    } catch (caught) {
      setError("Gagal masuk menggunakan Google.");
    }
  }

  const registering = mode === "register";

  return (
    <main className="bg-dynamic flex min-h-screen bg-[#fafafa] dark:bg-[#0a0000] transition-colors relative overflow-hidden">
      {/* Unified Background Glows spanning the entire screen */}
      <div aria-hidden className="pointer-events-none absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-red-500/10 blur-[120px] animate-glow-pulse dark:bg-red-600/8" />
      <div aria-hidden className="pointer-events-none absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-black/5 blur-[100px] animate-glow-pulse dark:bg-red-900/10" style={{animationDelay: '2s'}} />

      {/* Back Button */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-50">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 transition-colors bg-white/40 dark:bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-neutral-200 dark:border-white/5 shadow-sm hover:shadow-md">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          Kembali ke Beranda
        </Link>
      </div>

      {/* Left Side — Immersive Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-transparent">
        {/* Brand Text */}
        <div className="relative z-10 text-center px-12 animate-fade-in-up">
          <div className="mb-10 flex justify-center relative">
            <Image src={logoLight} alt="SmartSchedule Logo" className="h-32 w-auto object-contain drop-shadow-xl dark:hidden" priority />
            <Image src={logoDark} alt="SmartSchedule Logo" className="h-32 w-auto object-contain drop-shadow-xl hidden dark:block" priority />
          </div>
          <h2 className="text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-4">SmartSchedule</h2>
          <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto">
            Platform modern untuk mengelola seluruh jadwal Anda dengan cerdas, dan efisien.
          </p>
        </div>
      </div>

      {/* Right Side — Auth Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 relative">
        {/* Background glow */}
        <div aria-hidden className="pointer-events-none absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-red-500/5 blur-[100px] dark:bg-red-600/8" />

        <div className="w-full max-w-md glass-card p-8 sm:p-10 animate-fade-in-up relative z-10">
          <div className="flex flex-col gap-2 text-center mb-8">
            {/* Mobile brand */}
            <div className="lg:hidden mb-4 flex justify-center">
              <Image src={logoLight} alt="SmartSchedule Logo" className="h-16 w-auto object-contain dark:hidden" />
              <Image src={logoDark} alt="SmartSchedule Logo" className="h-16 w-auto object-contain hidden dark:block" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{registering ? "Buat akun baru" : "Selamat datang kembali"}</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{registering ? "Daftar untuk mulai mengelola jadwal Anda" : "Masuk untuk mengakses jadwal Anda"}</p>
          </div>

          {error && <div role="alert" className="mb-6 rounded-xl border border-red-200/60 bg-red-50/80 p-4 text-sm font-medium text-red-700 backdrop-blur-sm dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">{error}</div>}

          <form onSubmit={submit} className="flex flex-col gap-5">
            {registering && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="displayName" className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Nama Panggilan</label>
                <input
                  id="displayName"
                  type="text"
                  required
                  disabled={submitting}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-glass focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                  placeholder="Contoh: Fulan"
                />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Email</label>
              <input
                id="username"
                type="email"
                required
                disabled={submitting}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-glass focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                placeholder="nama@email.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Password</label>
              <input
                id="password"
                type="password"
                required
                disabled={submitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-glass focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                placeholder="Password min 8 karakter"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary mt-2 w-full text-sm font-bold"
            >
              {submitting ? "Memproses..." : registering ? "Daftar sekarang" : "Masuk"}
            </button>
          </form>

          {!registering && (
            <>
              <div className="my-6 flex items-center gap-4">
                <span className="flex-1 border-b border-neutral-200/60 dark:border-white/10" />
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">atau</span>
                <span className="flex-1 border-b border-neutral-200/60 dark:border-white/10" />
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="btn-ghost w-full flex items-center justify-center gap-3 text-sm font-semibold"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 0, 0)">
                    <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4c0,-0.32 -0.03,-0.64 -0.09,-0.97z" fill="#4285f4" />
                    <path d="M12,20.7c2.43,0 4.47,-0.8 5.96,-2.19l-3.3,-2.57c-0.9,0.6 -2.07,0.97 -3.36,0.97c-2.4,0 -4.43,-1.63 -5.16,-3.82H2.74v2.66c1.49,2.96 4.54,4.95 8.06,4.95z" fill="#34a853" />
                    <path d="M6.84,13.09c-0.18,-0.55 -0.29,-1.13 -0.29,-1.74s0.11,-1.19 0.29,-1.74V6.95H2.74C2.13,8.17 1.78,9.55 1.78,11s0.35,2.83 0.96,4.05l3.19,-2.48c0.16,-0.47 0.26,-0.98 0.26,-1.48z" fill="#fbbc05" />
                    <path d="M12,5.2c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58c-1.57,-1.46 -3.61,-2.35 -6.02,-2.35c-3.52,0 -6.57,1.99 -8.06,4.95l3.19,2.48c0.73,-2.19 2.76,-3.82 5.16,-3.82z" fill="#ea4335" />
                  </g>
                </svg>
                Masuk dengan Google
              </button>
            </>
          )}

          <p className="mt-8 text-center text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {registering ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
            <Link href={registering ? "/login" : "/register"} className="font-bold text-red-600 hover:text-red-500 transition-colors dark:text-red-400 dark:hover:text-red-300">{registering ? "Masuk di sini" : "Daftar di sini"}</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
