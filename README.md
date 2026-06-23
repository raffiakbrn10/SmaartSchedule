# SmartSchedule

SmartSchedule adalah manajer tugas dan _deadline_ berbasis TypeScript. Aplikasi ini memisahkan frontend (Next.js App Router) dan backend (Express API) untuk keamanan dan skalabilitas. Pada versi terbaru ini, kami telah **mengintegrasikan Supabase Auth (Google Login)** sambil tetap mempertahankan alur kerja utama aplikasi.

## 🚀 Fitur Utama

- **Supabase Authentication**: Login menggunakan Google sekali klik via Supabase OAuth.
- **Frontend Next.js**: Menggunakan App Router (React 19) dengan desain UI komponen modern.
- **Backend Express.js 5**: Menangani logika sinkronisasi data, keamanan (CORS, Rate Limiter), dan komunikasi database.
- **Integrasi Pihak Ketiga**: Siap mendukung Google Calendar (untuk event sync) dan Telegram Bot (untuk pengingat deadline).

---

## 🛠 Instalasi dan Menjalankan Lokal

Karena aplikasi ini sekarang bergantung pada **Supabase (PostgreSQL)**, kami telah menyediakan skrip otomatis untuk meluncurkannya menggunakan Docker Desktop di komputer Anda.

### Persyaratan
- Node.js versi 22+
- **Docker Desktop** (Pastikan dalam keadaan aktif dan "Engine running")

### 1. Kloning & Install Dependensi
```bash
git clone https://github.com/raffiakbrn10/SmaartSchedule.git
cd SmaartSchedule
npm ci
```

### 2. Atur Environment Variables
Kami telah menyediakan kerangka file _.env_ untuk Anda. Cukup gandakan (_copy_) kerangkanya agar tersembunyi dari repositori GitHub.

```bash
# Windows (PowerShell)
Copy-Item .env.example .env.local
```

File `.env.local` Anda sudah siap digunakan karena variabel bawaannya mengarah ke port lokal (3000 dan 4000) serta _Supabase Local Development_ (127.0.0.1).

### 3. Jalankan Aplikasi
Tinggal klik 2 kali atau jalankan skrip berikut di root folder. Skrip ini akan menyalakan **Docker untuk Supabase** dan server otomatis (Next.js & Express API):

```powershell
.\start-local.bat
```
Tunggu hingga selesai mengunduh container Supabase (pada jalankan pertama kali). Web akan otomatis terbuka di `http://localhost:3000`.

---

## 🗄️ Database Setup (Untuk Supabase Cloud / Hosting Asli)

Jika Anda ingin men-deploy proyek ini (menghubungkannya ke _project_ Supabase di _cloud_ sungguhan), masukkan kode struktur *database* yang telah kami buat ke **Supabase SQL Editor**:

1. Buka Dasbor Supabase Anda.
2. Buka menu **SQL Editor**.
3. Buka file `supabase/setup_schema.sql` di proyek ini, _copy_ seluruh isinya.
4. _Paste_ lalu jalankan di Supabase.

Backend akan secara otomatis memantau login via Google dan mendaftarkannya (tersinkronisasi) ke tabel `users` PostgreSQL Anda tanpa konfigurasi pemicu (_trigger_) terpisah!

---

## ⚙️ Pengembangan Lanjutan

Jika Anda memilih untuk tidak menggunakan `start-local.bat`, berikut adalah rincian _command_ manual yang bisa digunakan:

```bash
# Memastikan Supabase menyala (perlu Docker)
npx supabase start

# Menjalankan frontend dan backend bersamaan
npm run dev

# Menjalankan Linter / Pengecekan Types
npm run lint
npm run typecheck

# Menjalankan semua unit test menggunakan Vitest
npm test
```

## 🔐 Integrasi Lainnya (Telegram)

Untuk notifikasi jadwal ke Telegram:
1. Pesan ke `@BotFather` di aplikasi Telegram dan buat _bot_.
2. Dapatkan _Token_ lalu isikan di dalam `.env.local` pada `TELEGRAM_BOT_TOKEN`.
3. Setel `TELEGRAM_NOTIFICATIONS_ENABLED=true` jika sudah siap digunakan di mode _production_.

_(Fitur ini dinonaktifkan secara bawaan di `.env.example` untuk memudahkan pengembangan UI/Auth)._
