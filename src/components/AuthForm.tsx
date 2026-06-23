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

  return <main className="flex min-h-[80vh] items-center justify-center p-4">
    <div className="w-full max-w-md rounded-2xl border border-neutral-100 bg-white/80 p-6 shadow-xl backdrop-blur-md dark:border-neutral-900 dark:bg-black/80">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">{registering ? "Buat akun baru" : "Selamat datang kembali"}</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{registering ? "Daftar untuk mulai mengelola jadwal Anda" : "Masuk untuk mengakses jadwal Anda"}</p>
      </div>
      {error && <div role="alert" className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-950 dark:bg-red-950/20 dark:text-red-400">{error}</div>}
      <div className="mt-6">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Username</label>
            <input
              id="username"
              type="text"
              required
              disabled={submitting}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-sm font-medium transition focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-900/50 dark:focus:border-cyan-500"
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
              className="rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-sm font-medium transition focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-900/50 dark:focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50 dark:bg-cyan-600 dark:hover:bg-cyan-700"
          >
            {submitting ? "Memproses..." : registering ? "Daftar sekarang" : "Masuk"}
          </button>
        </form>
        {!registering && (
          <>
            <div className="my-5 flex items-center justify-between">
              <span className="w-1/5 border-b border-neutral-200 dark:border-neutral-800" />
              <span className="text-xs text-neutral-400 uppercase">atau</span>
              <span className="w-1/5 border-b border-neutral-200 dark:border-neutral-800" />
            </div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-800 dark:bg-black dark:text-neutral-300 dark:hover:bg-neutral-900"
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
        <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">{registering ? "Sudah punya akun?" : "Belum punya akun?"} <Link href={registering ? "/login" : "/register"} className="font-semibold text-emerald-600 hover:underline dark:text-cyan-400">{registering ? "Masuk di sini" : "Daftar di sini"}</Link></p>
      </div>
    </div>
  </main>;
}
