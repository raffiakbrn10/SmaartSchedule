"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const auth = useAuth();
  const router = useRouter();
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
        await auth.register({ username, password });
        router.replace("/login?registered=success");
      }
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Tidak dapat terhubung ke server.");
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
    <main className="bg-dynamic flex min-h-screen bg-[#fafafa] dark:bg-[#0a0000] transition-colors">
      {/* Left Side — Immersive Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-red-950 via-black to-red-900">
        {/* Ambient Glow Effects */}
        <div aria-hidden className="absolute top-1/4 left-1/3 h-64 w-64 rounded-full bg-red-600/20 blur-[100px] animate-glow-pulse" />
        <div aria-hidden className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-red-500/15 blur-[80px] animate-glow-pulse" style={{animationDelay: '2s'}} />

        {/* Floating Glass Shapes */}
        <div aria-hidden className="absolute top-[20%] left-[15%] h-32 w-32 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md animate-float rotate-12" />
        <div aria-hidden className="absolute bottom-[25%] right-[20%] h-24 w-24 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md animate-float-delayed -rotate-6" />
        <div aria-hidden className="absolute top-[55%] left-[60%] h-16 w-16 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md animate-float-slow rotate-45" />

        {/* Brand Text */}
        <div className="relative z-10 text-center px-12">
          <div className="mb-6 flex justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-3xl font-extrabold text-white shadow-2xl">S</span>
          </div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight">SmartSchedule</h2>
          <p className="mt-3 text-sm text-white/60 leading-6 max-w-xs mx-auto">Kelola jadwal harian dengan tampilan modern yang membantu aktivitas tetap teratur.</p>
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
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-800 font-bold text-white shadow-lg shadow-red-600/30 text-xl">S</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{registering ? "Buat akun baru" : "Selamat datang kembali"}</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{registering ? "Daftar untuk mulai mengelola jadwal Anda" : "Masuk untuk mengakses jadwal Anda"}</p>
          </div>

          {error && <div role="alert" className="mb-6 rounded-xl border border-red-200/60 bg-red-50/80 p-4 text-sm font-medium text-red-700 backdrop-blur-sm dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">{error}</div>}

          <form onSubmit={submit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Email</label>
              <input
                id="username"
                type="text"
                required
                disabled={submitting}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-glass"
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
                className="input-glass"
                placeholder="Masukkan password"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary mt-1 w-full text-sm"
            >
              {submitting ? "Memproses..." : registering ? "Daftar sekarang" : "Masuk"}
            </button>
          </form>

          {!registering && (
            <>
              <div className="my-6 flex items-center gap-4">
                <span className="flex-1 border-b border-neutral-200/60 dark:border-white/10" />
                <span className="text-xs text-neutral-400 uppercase font-medium tracking-wider">atau</span>
                <span className="flex-1 border-b border-neutral-200/60 dark:border-white/10" />
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="btn-ghost w-full flex items-center justify-center gap-2.5 text-sm"
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

          <p className="mt-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
            {registering ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
            <Link href={registering ? "/login" : "/register"} className="font-semibold text-red-600 hover:underline dark:text-red-400">{registering ? "Masuk di sini" : "Daftar di sini"}</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
