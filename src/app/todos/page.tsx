import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import logo from "@/images/Logo Smart Schedule.png";

export default async function TodosPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos } = await supabase.from("todos").select();

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 transition-colors dark:bg-black">
      <nav aria-label="Navigasi utama" className="mx-auto flex w-full max-w-7xl items-center justify-between p-5 sm:p-6">
        <Link href="/" className="flex items-center gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500">
          <Image src={logo} alt="SmartSchedule Logo" className="h-10 w-auto object-contain" />
          <span className="text-xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100 sm:text-2xl">SmartSchedule</span>
        </Link>
      </nav>

      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-16">
        <div aria-hidden className="absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl dark:bg-cyan-500/10" />
        
        <div className="relative w-full max-w-md rounded-3xl border border-neutral-200/80 bg-white/70 p-8 shadow-xl backdrop-blur-md dark:border-neutral-850 dark:bg-neutral-900/70">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              Daftar <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent dark:from-cyan-400 dark:to-blue-500">Tugas</span>
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Data realtime tersinkronisasi dengan Supabase SSR</p>
          </div>

          {!todos || todos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Belum ada tugas yang tersimpan.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-neutral-50/50 p-4 transition hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:bg-neutral-800/60"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-cyan-500/10 dark:text-cyan-400">
                    ✓
                  </span>
                  <span className="text-base text-neutral-700 dark:text-neutral-300">{todo.name}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex justify-center">
            <Link
              href="/"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 dark:text-cyan-400 dark:hover:text-cyan-300"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
