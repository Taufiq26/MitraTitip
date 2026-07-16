# Backlog

<!-- Fitur yang ditunda. Setiap entri menyimpan analisis dampak lengkap agar
     promosi nanti dimulai dari kerja yang sudah tersimpan — namun analisisnya
     WAJIB divalidasi ulang terhadap core docs terkini sebelum dieksekusi. -->

## BL-1 — Perbaiki urutan cascade delete saat penghapusan tenant

- **Date deferred:** 2026-07-16
- **Status:** deferred
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
