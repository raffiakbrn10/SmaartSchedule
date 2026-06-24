import Link from "next/link";
export default function NotFound() {
  return (
    <main className="bg-dynamic flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0000] p-6 text-center">
      <div className="glass-card p-8 animate-fade-in-up">
        <p className="text-6xl font-extrabold text-gradient">404</p>
        <h1 className="mt-4 text-2xl font-extrabold">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">Halaman yang kamu cari tidak tersedia.</p>
        <Link href="/" className="btn-primary mt-6 inline-block text-sm">Kembali ke beranda</Link>
      </div>
    </main>
  );
}
