"use client";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset(): void }) {
  return (
    <main className="bg-dynamic flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0000] p-6">
      <div className="glass-card max-w-md text-center p-8 animate-fade-in-up">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100/80 text-red-600 dark:bg-red-950/30 dark:text-red-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
        </div>
        <h1 className="text-2xl font-extrabold">Halaman tidak dapat dimuat</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">Terjadi kesalahan sementara. Coba muat ulang bagian ini.</p>
        <button onClick={reset} className="btn-primary mt-6 text-sm">Coba lagi</button>
      </div>
    </main>
  );
}
