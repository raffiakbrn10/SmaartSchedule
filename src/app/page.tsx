import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import logoLight from "@/images/Logo-Light.png";
import logoDark from "@/images/Logo-Dark.png";

export default function HomePage() {
  return (
    <div className="bg-dynamic min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#0a0000] transition-colors relative">
      {/* Theme Toggle Floating at Top Right */}
      <div className="absolute right-5 top-5 z-50">
        <ThemeToggle />
      </div>

      {/* Hero */}
      <main className="relative flex flex-col items-center justify-center overflow-hidden px-5 pt-32 pb-20 text-center">
        {/* Background Glow */}
        <div aria-hidden className="pointer-events-none absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-red-500/10 blur-[120px] animate-glow-pulse dark:bg-red-600/8" />
        <div aria-hidden className="pointer-events-none absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-black/5 blur-[100px] animate-glow-pulse dark:bg-red-900/10" style={{animationDelay: '2s'}} />

        <div className="relative max-w-5xl animate-fade-in-up">
          <div className="mx-auto mb-6 flex h-32 w-auto justify-center">
            <Image src={logoLight} alt="SmartSchedule Logo" className="h-full w-auto object-contain drop-shadow-2xl dark:hidden" priority />
            <Image src={logoDark} alt="SmartSchedule Logo" className="h-full w-auto object-contain drop-shadow-2xl hidden dark:block" priority />
          </div>
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.25em] text-red-600 dark:text-red-400">SmartSchedule</p>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight leading-[1.1] sm:text-6xl md:text-7xl">
            Kelola Jadwal harianmu<br className="hidden md:block" /> <span className="text-gradient">Lebih Cerdas dan Terstruktur</span>
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-400 sm:text-lg">
            Tingkatkan produktivitas dengan sistem penjadwalan yang terorganisir. Smart Schedule memudahkan Anda mengelola daftar tugas dan memantau setiap perkembangan melalui fitur analisis progres yang komprehensif, SmartSchedule membantu Anda fokus pada apa yang benar-benar penting.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/login" className="btn-primary text-center text-sm sm:text-base">Ayo mulai atur jadwalmu</Link>
            <a href="#fitur" className="btn-ghost text-center text-sm sm:text-base">Pelajari fitur</a>
          </div>
        </div>
      </main>

      {/* Tujuan Section */}
      <section id="tujuan" className="relative z-10 mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 animate-fade-in-up">
            <h2 className="mb-6 text-3xl font-extrabold sm:text-4xl leading-tight">
              Tujuan Utama Kami:<br />
              <span className="text-red-600 dark:text-red-400">Membantu Anda dalam mengelola jadwal secara terstruktur</span>
            </h2>
            <p className="mb-6 text-base leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-lg">
              Kami menyadari bahwa di era dengan ritme yang serba cepat ini, mengelola jadwal yang dinamis sering kali menjadi tantangan tersendiri. Anda dituntut untuk menyeimbangkan tenggat waktu dari berbagai tugas, proyek, rapat penting, hingga agenda personal, yang sering kali datanya tersebar di berbagai platform. Memantau semuanya secara manual tentu sangat tidak efisien dan rentan terhadap kesalahan.
            </p>
            <p className="text-base leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-lg">
              Oleh karena itu, SmartSchedule dirancang sebagai mesin produktivitas tangguh yang bekerja secara cerdas dan otomatis di balik layar. Dengan <strong className="font-bold text-neutral-900 dark:text-white">kapabilitas integrasi dan otomatisasi tingkat lanjut</strong>, Anda tidak perlu lagi menyusun jadwal secara manual. Biarkan teknologi kami yang mengatur alur kerja Anda, sehingga Anda dapat fokus pada hasil yang berdampak tinggi.
            </p>
          </div>
          <div className="w-full lg:w-1/2">
            <div className="glass-card glow-border p-8 sm:p-10 flex flex-col gap-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="flex gap-6 items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-xl font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400 shadow-inner">01</div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">Sentralisasi Jadwal</h3>
                  <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">Gabungkan seluruh tugas, proyek, dan kalender dari berbagai sumber ke dalam satu dashboard komprehensif. Dapatkan visibilitas penuh atas seluruh aktivitas Anda tanpa perlu membuang waktu berpindah-pindah aplikasi.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-xl font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400 shadow-inner">02</div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">Otomatisasi Jadwal Presisi</h3>
                  <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">Teknologi kami secara dinamis mengelola prioritas dan mensinkronisasikan tenggat waktu ke seluruh perangkat Anda secara real-time.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-xl font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400 shadow-inner">03</div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">Analitik & Eksekusi Optimal</h3>
                  <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">Ubah cara kerja Anda dengan wawasan berbasis data. Fitur analisis progres kami membantu Anda melacak produktivitas secara akurat. Kurangi waktu yang terbuang untuk sekadar merencanakan, dan alokasikan energi penuh Anda untuk eksekusi yang optimal.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="fitur" className="relative z-10 mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
        <div className="mb-16 text-center animate-fade-in-up">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Fitur Unggulan</h2>
          <p className="mt-4 text-neutral-500 dark:text-neutral-400">Semua yang Anda butuhkan untuk manajemen waktu yang efisien.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "Kelola jadwal tugas", desc: "Atur, edit, dan hapus jadwal harian dengan antarmuka yang intuitif dan terstruktur. Tersedia sinkronisasi otomatis ke kalender Anda.", icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg> },
            { title: "Atur deadline", desc: "Tentukan tenggat waktu untuk setiap tugas dan dapatkan notifikasi presisi secara real-time agar tidak ada tugas yang terlewat.", icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> },
            { title: "Pantau progres", desc: "Lihat perkembangan tugas Anda dengan visualisasi ringkas dan analitik komprehensif di dalam Dashboard interaktif.", icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg> },
          ].map((feat, i) => (
            <article key={feat.title} className={`glass-card glass-card-hover glow-border p-8 opacity-0 animate-fade-in-up stagger-${i + 1}`}>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 shadow-inner">
                {feat.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold">{feat.title}</h3>
              <p className="text-sm leading-6 text-neutral-500 dark:text-neutral-400">{feat.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 mx-auto w-full max-w-4xl px-5 py-24 text-center">
        <div className="glass-card p-12 glow-border flex flex-col items-center">
          <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">Siap untuk lebih produktif?</h2>
          <p className="mb-8 text-neutral-500 dark:text-neutral-400">Bergabunglah dengan SmartSchedule hari ini dan rasakan perbedaannya secara langsung.</p>
          <Link href="/register" className="btn-primary text-base px-8 py-3.5">Coba gratis sekarang</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-200/50 bg-white/20 dark:border-white/5 dark:bg-[#0a0000]/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-5 py-8 text-center sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <Image src={logoLight} alt="SmartSchedule Logo" className="h-8 w-auto object-contain dark:hidden" />
            <Image src={logoDark} alt="SmartSchedule Logo" className="h-8 w-auto object-contain hidden dark:block" />
            <span className="font-bold tracking-tight">SmartSchedule V1</span>
          </div>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-500">
            copyright&copy; 2026 Raffiakbarn. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
