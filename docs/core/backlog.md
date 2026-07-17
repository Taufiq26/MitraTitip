# Backlog

<!-- Fitur yang ditunda. Setiap entri menyimpan analisis dampak lengkap agar
     promosi nanti dimulai dari kerja yang sudah tersimpan — namun analisisnya
     WAJIB divalidasi ulang terhadap core docs terkini sebelum dieksekusi. -->

## BL-1 — Perbaiki urutan cascade delete saat penghapusan tenant

- **Date deferred:** 2026-07-16
- **Status:** promoted (2026-07-17)
- **Description:** Saat membersihkan data uji coba pasca-testing Phase 6,
  `DELETE` langsung pada baris `tenants` gagal dengan pelanggaran FK
  (`transaction_items_product_id_fkey`) karena `transaction_items.product_id`
  tidak punya `ON DELETE CASCADE`, sehingga Postgres bisa mencoba menghapus
  `products` sebelum `transaction_items` yang mereferensikannya selesai
  dihapus lewat cascade dari `transactions`. Penghapusan manual berurutan
  (transaction_items → transactions → settlements → consignment_batches →
  consignors → products → profiles → tenants) berhasil sebagai workaround.
  Fitur "hapus/suspend tenant" oleh Super Admin sendiri belum ada di scope
  saat ini (lihat requirements.md — Out of scope), jadi ini belum berdampak
  ke pengguna, tapi perlu diperbaiki sebelum fitur tersebut dibangun.

### Impact analysis (saved 2026-07-16)

| Affected doc | Section | Change |
|---|---|---|
| database.md | transaction_items.product_id | Ubah FK jadi `on delete restrict` eksplisit dengan penanganan aplikasi (arsipkan transaksi lama, jangan hard-delete), atau tambah alur soft-delete tenant (`deactivated_at`) alih-alih hard delete |
| phases.md | Fase baru | "Manajemen tenant lanjutan" (suspend/hapus tenant) — saat ini out of scope |

**Estimated mandays delta:** 1–2 (Backend, saat fitur manajemen tenant lanjutan mulai dikerjakan)

## BL-2 — Scan barcode tambah barang, performa navigasi, quick-add titipan, riwayat settlement

- **Date deferred:** 2026-07-17
- **Status:** promoted (2026-07-17)
- **Description:** Empat perbaikan diminta user lewat `/devpilot feature`:
  1. Scan barcode kamera saat menambah barang baru di halaman Barang (saat
     ini field barcode di form tambah/edit produk hanya bisa diketik manual;
     scan kamera baru ada di halaman Kasir).
  2. Perbaikan delay beberapa detik setiap pindah menu. Root cause sudah
     didiagnosis: `middleware.ts` memanggil `supabase.auth.getUser()`, lalu
     `getCurrentProfile()` di `dashboard/layout.tsx` memanggil `getUser()`
     lagi + query `profiles` — dua round-trip auth berurutan sebelum halaman
     tujuan sempat menjalankan query datanya sendiri. Tidak ada `loading.tsx`
     di rute manapun sehingga navigasi terasa freeze.
  3. Tombol aksi cepat "Tambah Titipan" langsung di baris tabel
     `/dashboard/consignors`, tanpa harus masuk ke halaman detail penitip
     dulu — cukup reuse komponen `BatchDialog` yang sudah ada.
  4. Settlement yang sudah difinalisasi (`status = 'paid'`) perlu tampil
     dengan tanda/badge di suatu daftar riwayat, dan bisa dilihat/dicetak
     ulang struknya — saat ini tidak ada halaman riwayat settlement sama
     sekali, hanya alur create-preview-finalize yang hasilnya tidak
     tersimpan secara visual setelah itu.

### Impact analysis (saved 2026-07-17)

| Affected doc | Section | Change |
|---|---|---|
| requirements.md | FR baru | Scan barcode kamera saat tambah/edit barang (bukan hanya di Kasir) |
| requirements.md | FR-9 (disempurnakan) | Titipan bisa ditambah langsung dari daftar penitip |
| requirements.md | FR-12 (diperluas) | Riwayat settlement dengan status + struk yang bisa dilihat/dicetak ulang |
| architecture.md | Scaling & reliability notes | Hindari auth check ganda (middleware + layout) per navigasi; tambah `loading.tsx` per rute dashboard |
| features.md | Modul Manajemen Barang & Stok | Fitur baru: scan barcode saat tambah barang |
| features.md | Modul Barang Titipan | Fitur baru: quick-add titipan dari list penitip |
| features.md | Modul Barang Titipan | Fitur baru: halaman riwayat settlement + struk |
| database.md | — | Tidak ada perubahan skema (tabel `settlements` sudah cukup untuk riwayat) |
| phases.md | Phase 7 (baru) | "Peningkatan Kasir & Penitip" — 4 task di atas |

**Estimated mandays delta:** ~6-8 (Frontend 4, Backend 1, QA 1-2)

<!-- Format entri:

## BL-1 — {judul fitur}

- **Date deferred:** {YYYY-MM-DD}
- **Status:** deferred | promoted ({YYYY-MM-DD}) | dropped
- **Description:** {…}

### Impact analysis (saved {YYYY-MM-DD})

| Affected doc | Section | Change |
|---|---|---|
| database.md | Tables | {new table …} |

**Estimated mandays delta:** {n} ({division breakdown})
-->
