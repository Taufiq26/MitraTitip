# Execution Phases

<!-- Status values: pending / in progress / done.
     Centang task SEGERA saat selesai, jangan ditunda sampai akhir fase.
     Setiap fase selesai mendapat git commit checkpoint. -->

## Overview

| Phase | Name | Status | Checkpoint commit |
|---|---|---|---|
| 1 | Setup Proyek & Fondasi Multi-Tenant | done | e2f7075 |
| 2 | Manajemen Barang & Stok | done | |
| 3 | Barang Titipan (Consignment) | done | |
| 4 | Transaksi Kasir (POS) & Offline Mode | done | |
| 5 | Laporan & Insight | done | |
| 6 | Panel Super Admin & Hardening | done | |
| 7 | Peningkatan Kasir, Penitip & Integritas Data | done | |
| 8 | Registrasi WA, Verifikasi Email & Fondasi Billing | done | |
| 9 | Perhitungan Tagihan & Pembatasan Akses | pending | |
| 10 | Integrasi Pembayaran Midtrans | pending | |
| 11 | Panel Super Admin — Billing | pending | |

## Phase 1 — Setup Proyek & Fondasi Multi-Tenant `[done]`

**Goal:** Project scaffolding, koneksi Supabase, skema database dasar, autentikasi, dan isolasi tenant siap dipakai fase-fase berikutnya.
**Depends on:** —

- [x] 1.1 Setup project Next.js + TypeScript + Tailwind CSS + shadcn/ui
- [x] 1.2 Setup Supabase project & koneksi (environment variables)
- [x] 1.3 Buat skema database awal (tenants, profiles, products, consignors) sesuai database.md
- [x] 1.4 Implementasi RLS policies untuk isolasi data per tenant
- [x] 1.5 Implementasi autentikasi (login, session) untuk Admin & Kasir
- [x] 1.6 Halaman registrasi tenant mandiri (self-service signup)
- [x] 1.7 Setup deployment awal ke Vercel

## Phase 2 — Manajemen Barang & Stok `[done]`

**Goal:** Admin dapat mengelola barang dan sistem melacak stok secara otomatis.
**Depends on:** Phase 1

- [x] 2.1 CRUD produk (nama, barcode, kategori, harga modal, harga jual, satuan)
- [x] 2.2 Toggle pelacakan stok per produk
- [x] 2.3 Logika update stok otomatis (dipanggil dari transaksi di Phase 4)
- [x] 2.4 Halaman daftar/notifikasi low stock

## Phase 3 — Barang Titipan (Consignment) `[done]`

**Goal:** Fitur titipan lengkap: registrasi, perhitungan fee, retur, dan settlement.
**Depends on:** Phase 2

- [x] 3.1 CRUD data penitip
- [x] 3.2 Registrasi batch barang titipan (harian, qty, fee % default 10%)
- [x] 3.3 Logika perhitungan otomatis bagian penitip (dipakai saat barang terjual di Phase 4)
- [x] 3.4 Proses retur barang titipan yang tidak terjual
- [x] 3.5 Generate rekap settlement (preview) + finalisasi

## Phase 4 — Transaksi Kasir (POS) & Offline Mode `[done]`

**Goal:** Alur kasir lengkap: scan barcode, pembayaran, preview struk, bekerja offline dengan sinkronisasi otomatis.
**Depends on:** Phase 2, Phase 3

- [x] 4.1 UI transaksi kasir & keranjang belanja
- [x] 4.2 Integrasi scan barcode (USB scanner & kamera)
- [x] 4.3 Metode pembayaran (tunai + kembalian, QRIS, transfer)
- [x] 4.4 Preview & format struk (cetak opsional, siap integrasi printer termal)
- [x] 4.5 Setup PWA & service worker
- [x] 4.6 Penyimpanan transaksi lokal (Dexie/IndexedDB) saat offline
- [x] 4.7 Antrian sinkronisasi otomatis & resolusi konflik ke Supabase

## Phase 5 — Laporan & Insight `[done]`

**Goal:** Dashboard laporan penjualan, laba, dan insight bisnis untuk Admin.
**Depends on:** Phase 4

- [x] 5.1 Laporan penjualan per periode & metode pembayaran
- [x] 5.2 Laporan laba kotor & laba bersih
- [x] 5.3 Insight produk terlaris
- [x] 5.4 Dashboard ringkasan Admin

## Phase 6 — Panel Super Admin & Hardening `[done]`

**Goal:** Monitoring tenant untuk pemilik platform, QA menyeluruh, dan kesiapan produksi.
**Depends on:** Phase 5

- [x] 6.1 Panel Super Admin (daftar & monitoring tenant)
- [x] 6.2 Uji end-to-end alur offline-to-online sync
- [x] 6.3 Uji UX dengan skenario pengguna awam/gaptek
- [x] 6.4 Perbaikan bug & polish UI/UX final
- [x] 6.5 Deployment production & dokumentasi akhir

## Phase 7 — Peningkatan Kasir, Penitip & Integritas Data `[done]`

**Goal:** Promosi BL-1 (integritas data saat hapus barang/tenant) dan BL-2 (scan barcode tambah barang, performa navigasi, quick-add titipan, riwayat settlement + struk).
**Depends on:** Phase 6

- [x] 7.1 Migration: `transaction_items.product_id` & `consignment_batch_id` jadi nullable + `on delete set null`; guard hapus barang yang punya riwayat transaksi (BL-1)
- [x] 7.2 Scan barcode kamera saat tambah/edit barang di halaman Barang
- [x] 7.3 Perbaikan performa navigasi: hilangkan auth check ganda (middleware + layout), tambah `loading.tsx` per rute dashboard
- [x] 7.4 Quick-add titipan langsung di baris tabel Penitip (reuse `BatchDialog`)
- [x] 7.5 Halaman riwayat settlement dengan badge status "Sudah Direalisasi" + lihat/cetak ulang struk

## Phase 8 — Registrasi WA, Verifikasi Email & Fondasi Billing `[done]`

**Goal:** Registrasi tenant mengumpulkan nomor WA & memverifikasi email sebelum akun aktif; skema database subscription/invoice siap dengan trial otomatis 1 bulan.
**Depends on:** Phase 7

- [x] 8.1 Migration: tambah `tenants.whatsapp_number` (not null), `profiles.email_verification_token`/`email_verification_sent_at`/`email_verified_at`
- [x] 8.2 Migration: tabel baru `subscriptions` & `invoices` + RLS policies (tenant hanya lihat baris miliknya, super_admin lihat semua)
- [x] 8.3 Setup Mailgun (util pengirim email transactional via REST API langsung, tanpa SDK tambahan) dan env var `MAILGUN_API_KEY`/`MAILGUN_DOMAIN`/`MAILGUN_FROM`
- [x] 8.4 Update `POST /api/tenants/register`: wajib `whatsapp_number`, generate `email_verification_token`, kirim email verifikasi, buat baris `subscriptions` (trial, `trial_end` = +30 hari)
- [x] 8.5 Endpoint `GET /api/verify-email` & `POST /api/verify-email/resend`
- [x] 8.6 Halaman/UI: form registrasi tambah field WA; halaman "cek email Anda" pasca-registrasi (`/register/check-email`) + halaman verifikasi (`/verify-email`); blokir login dengan pesan jelas jika role `admin` dan `email_verified_at` masih null

## Phase 9 — Perhitungan Tagihan & Pembatasan Akses `[pending]`

**Goal:** Tagihan bulanan terhitung otomatis dari pendapatan bersih, dan akses POS dibatasi otomatis saat menunggak lewat grace period.
**Depends on:** Phase 8

- [ ] 9.1 Logika hitung pendapatan bersih per tenant per periode: margin non-konsinyasi (`transaction_items` tanpa `consignment_batch_id`) + `settlements.total_fee` dalam rentang periode
- [ ] 9.2 Job/endpoint generate invoice bulanan (buat baris `invoices` dari `subscriptions` yang trial-nya sudah berakhir), hitung `amount_due`, `due_date`, `grace_end`
- [ ] 9.3 Transisi status invoice otomatis (unpaid → overdue saat lewat `due_date`; `subscriptions.status` trial → active → grace → suspended mengikuti status invoice terbaru)
- [ ] 9.4 Middleware/route guard: blokir rute Kasir/POS saat `subscriptions.status = suspended`, redirect ke halaman tagihan dengan pesan jelas; rute laporan & riwayat tetap dapat diakses read-only

## Phase 10 — Integrasi Pembayaran Midtrans `[pending]`

**Goal:** Tenant dapat membayar tagihan langsung lewat Midtrans dan melihat status/riwayat pembayarannya sendiri.
**Depends on:** Phase 9

- [ ] 10.1 Setup Midtrans SDK (sandbox key via env var `MIDTRANS_SERVER_KEY`/`MIDTRANS_CLIENT_KEY`)
- [ ] 10.2 Endpoint `POST /api/tenant/billing/:invoiceId/pay`: create Snap transaction, simpan `midtrans_order_id`
- [ ] 10.3 Endpoint `POST /api/billing/webhook/midtrans`: verifikasi signature, update status invoice & subscription secara idempotent berdasarkan `order_id`
- [ ] 10.4 Halaman dashboard tagihan tenant (`/dashboard/billing`): tagihan berjalan + tombol bayar, riwayat pembayaran dengan status

## Phase 11 — Panel Super Admin — Billing `[pending]`

**Goal:** Super Admin dapat mengelola fee per tenant, menandai pembayaran manual, dan memantau piutang platform secara keseluruhan.
**Depends on:** Phase 10

- [ ] 11.1 Endpoint & UI: lihat & edit `fee_percent` per tenant (`PATCH /api/admin/tenants/:id/fee`)
- [ ] 11.2 Endpoint & UI: tandai invoice lunas manual (`PATCH /api/admin/invoices/:id/mark-paid`)
- [ ] 11.3 Endpoint & UI: laporan piutang platform (`GET /api/admin/billing`) — pendapatan bersih semua tenant, tagihan seharusnya, status per tenant, filter per periode
- [ ] 11.4 QA end-to-end: alur registrasi → verifikasi email → trial habis → invoice terbit → bayar via Midtrans sandbox → akses pulih; dan alur menunggak → grace period habis → POS terkunci → laporan tetap terbuka
