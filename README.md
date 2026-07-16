# MitraTitip

Aplikasi kasir (POS) berbasis web untuk UMKM dan kantin sekolah — mendukung
barcode scanner, manajemen stok, barang titipan (consignment) dengan fee
otomatis, laporan penjualan/laba, dan bekerja offline dengan sinkronisasi
otomatis. Multi-tenant: setiap toko yang mendaftar bersifat independen.

Dokumentasi lengkap (requirements, arsitektur, skema database, rencana
fase pengembangan) ada di [`docs/core/`](./docs/core/).

## Live

- Production: https://mitratitip.vercel.app
- Panel Super Admin: https://mitratitip.vercel.app/super-admin (khusus akun `super_admin`)

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS + shadcn/ui (Base UI) ·
Supabase (Postgres + Auth) · Dexie.js (IndexedDB, offline-first) · PWA ·
Vercel.

## Setup lokal

1. Install dependencies:

   ```bash
   npm install
   ```

2. Salin `.env.example` ke `.env.local` dan isi dengan kredensial Supabase
   project Anda (Project Settings → API di dashboard Supabase):

   ```bash
   cp .env.example .env.local
   ```

3. Jalankan migration database. Buka **SQL Editor** di dashboard Supabase
   project Anda, lalu jalankan file di `supabase/migrations/` **berurutan
   sesuai nomornya** (0001, 0002, 0003, ...):

   - `0001_init.sql` — skema tabel inti (tenants, profiles, products, dst.)
   - `0002_rls.sql` — Row Level Security untuk isolasi data antar tenant
   - `0003_stock_functions.sql` — fungsi pengurangan stok otomatis
   - `0004_settlement_functions.sql` — fungsi perhitungan settlement titipan
   - `0005_consignment_sale_function.sql` — fungsi update qty terjual titipan

4. Jalankan development server:

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000).

## Catatan penting

- **Service worker (PWA) hanya aktif di production build.** Di development,
  service worker sengaja tidak didaftarkan karena bentrok dengan Fast
  Refresh/HMR Next.js.
- Registrasi tenant baru (self-service) tersedia di halaman `/register`.
  Akun pertama yang dibuat otomatis berperan sebagai Admin untuk tenant
  tersebut.
- Akun `super_admin` (untuk memantau daftar tenant di `/super-admin`) tidak
  bisa dibuat lewat `/register` — buat manual lewat Supabase Auth lalu set
  `role = 'super_admin'` pada baris `profiles` terkait (kolom `tenant_id`
  dibiarkan `null`).

## Struktur dokumentasi project

| Dokumen | Isi |
|---|---|
| `docs/core/requirements.md` | Tujuan produk, functional & non-functional requirements |
| `docs/core/architecture.md` | Diagram sistem, komponen, environment |
| `docs/core/database.md` | ERD dan definisi tabel |
| `docs/core/api-contract.md` | Kontrak endpoint API custom |
| `docs/core/features.md` | Daftar fitur & estimasi mandays per modul |
| `docs/core/phases.md` | Rencana & progres eksekusi per fase |

## Deploy

Repo ini terhubung ke Vercel dan auto-deploy setiap push ke branch `main`.
