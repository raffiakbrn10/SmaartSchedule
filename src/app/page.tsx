import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HomePage() {
  return <div className="bg-dynamic min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#0a0000] transition-colors">
    {/* Navbar */}
    <nav aria-label="Navigasi utama" className="sticky top-0 z-40 backdrop-blur-2xl bg-white/60 dark:bg-[#0a0000]/60 border-b border-white/20 dark:border-white/5">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-800 font-bold text-white shadow-lg shadow-red-600/30 transition-transform group-hover:scale-105">S</span>
          <span className="text-xl font-extrabold tracking-tight sm:text-2xl">SmartSchedule</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/login" className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">Dashboard</Link>
          <Link href="/login" className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">Jadwal Tugas</Link>
          <Link href="/login" className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">Pengaturan</Link>
        </div>
        <ThemeToggle />
      </div>
    </nav>

    {/* Hero */}
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-20 text-center">
      {/* Background Glow */}
      <div aria-hidden className="pointer-events-none absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-red-500/10 blur-[120px] animate-glow-pulse dark:bg-red-600/8" />
      <div aria-hidden className="pointer-events-none absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-black/5 blur-[100px] animate-glow-pulse dark:bg-red-900/10" style={{animationDelay: '2s'}} />

      <div className="relative max-w-5xl animate-fade-in-up">
        <p className="mb-5 text-sm font-bold uppercase tracking-[0.25em] text-red-600 dark:text-red-400">Fokus pada yang penting</p>
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight leading-[1.1] sm:text-6xl md:text-7xl">
          Kelola Jadwal Lebih<br className="hidden md:block" /> <span className="text-gradient">Modern dan Terorganisir</span>
        </h1>
        <p className="mx-auto mb-12 max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-400 sm:text-lg">
          Kelola tugas dan jadwal harian dengan tampilan modern yang membantu aktivitas tetap teratur dan mudah dipantau.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/login" className="btn-primary text-center text-sm sm:text-base">Ayo mulai atur jadwalmu</Link>
          <Link href="/register" className="btn-ghost text-center text-sm sm:text-base">Pelajari fitur</Link>
        </div>
      </div>
    </main>

    {/* Feature Cards */}
    <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 sm:px-8">
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "Kelola jadwal tugas", desc: "Atur, edit, dan hapus jadwal harian dengan antarmuka yang intuitif dan terstruktur.", icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg> },
          { title: "Atur deadline", desc: "Tentukan tenggat waktu untuk setiap tugas dan dapatkan pengingat otomatis saat mendekat.", icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> },
          { title: "Pantau progres tugas", desc: "Lihat perkembangan tugas secara real-time dengan visualisasi progres yang informatif.", icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg> },
        ].map((feat, i) => (
          <article key={feat.title} className={`glass-card glass-card-hover glow-border p-8 opacity-0 animate-fade-in-up stagger-${i + 1}`}>
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {feat.icon}
            </div>
            <h3 className="mb-2 text-lg font-bold">{feat.title}</h3>
            <p className="text-sm leading-6 text-neutral-500 dark:text-neutral-400">{feat.desc}</p>
          </article>
        ))}
      </div>
    </section>
  </div>;
}
