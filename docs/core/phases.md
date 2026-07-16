# Execution Phases

<!-- Status values: pending / in progress / done.
     Centang task SEGERA saat selesai, jangan ditunda sampai akhir fase.
     Setiap fase selesai mendapat git commit checkpoint. -->

## Overview

| Phase | Name | Status | Checkpoint commit |
|---|---|---|---|
| 1 | Setup Proyek & Fondasi Multi-Tenant | done | e2f7075 |
| 2 | Manajemen Barang & Stok | pending | |
| 3 | Barang Titipan (Consignment) | pending | |
| 4 | Transaksi Kasir (POS) & Offline Mode | pending | |
| 5 | Laporan & Insight | pending | |
| 6 | Panel Super Admin & Hardening | pending | |

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

## Phase 2 — Manajemen Barang & Stok `[pending]`

**Goal:** Admin dapat mengelola barang dan sistem melacak stok secara otomatis.
**Depends on:** Phase 1

- [ ] 2.1 CRUD produk (nama, barcode, kategori, harga modal, harga jual, satuan)
- [ ] 2.2 Toggle pelacakan stok per produk
- [ ] 2.3 Logika update stok otomatis (dipanggil dari transaksi di Phase 4)
- [ ] 2.4 Halaman daftar/notifikasi low stock

## Phase 3 — Barang Titipan (Consignment) `[pending]`

**Goal:** Fitur titipan lengkap: registrasi, perhitungan fee, retur, dan settlement.
**Depends on:** Phase 2

- [ ] 3.1 CRUD data penitip
- [ ] 3.2 Registrasi batch barang titipan (harian, qty, fee % default 10%)
- [ ] 3.3 Logika perhitungan otomatis bagian penitip (dipakai saat barang terjual di Phase 4)
- [ ] 3.4 Proses retur barang titipan yang tidak terjual
- [ ] 3.5 Generate rekap settlement (preview) + finalisasi

## Phase 4 — Transaksi Kasir (POS) & Offline Mode `[pending]`

**Goal:** Alur kasir lengkap: scan barcode, pembayaran, preview struk, bekerja offline dengan sinkronisasi otomatis.
**Depends on:** Phase 2, Phase 3

- [ ] 4.1 UI transaksi kasir & keranjang belanja
- [ ] 4.2 Integrasi scan barcode (USB scanner & kamera)
- [ ] 4.3 Metode pembayaran (tunai + kembalian, QRIS, transfer)
- [ ] 4.4 Preview & format struk (cetak opsional, siap integrasi printer termal)
- [ ] 4.5 Setup PWA & service worker
- [ ] 4.6 Penyimpanan transaksi lokal (Dexie/IndexedDB) saat offline
- [ ] 4.7 Antrian sinkronisasi otomatis & resolusi konflik ke Supabase

## Phase 5 — Laporan & Insight `[pending]`

**Goal:** Dashboard laporan penjualan, laba, dan insight bisnis untuk Admin.
**Depends on:** Phase 4

- [ ] 5.1 Laporan penjualan per periode & metode pembayaran
- [ ] 5.2 Laporan laba kotor & laba bersih
- [ ] 5.3 Insight produk terlaris
- [ ] 5.4 Dashboard ringkasan Admin

## Phase 6 — Panel Super Admin & Hardening `[pending]`

**Goal:** Monitoring tenant untuk pemilik platform, QA menyeluruh, dan kesiapan produksi.
**Depends on:** Phase 5

- [ ] 6.1 Panel Super Admin (daftar & monitoring tenant)
- [ ] 6.2 Uji end-to-end alur offline-to-online sync
- [ ] 6.3 Uji UX dengan skenario pengguna awam/gaptek
- [ ] 6.4 Perbaikan bug & polish UI/UX final
- [ ] 6.5 Deployment production & dokumentasi akhir
