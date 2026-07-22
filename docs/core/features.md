# Features & Estimates

> Mandays adalah estimasi perencanaan ("seolah dikerjakan oleh tim per divisi"), bukan komitmen. Eksekusi aktual dilakukan solo.

<!-- Satu tabel per modul. Kolom divisi mengikuti Divisi di config.md. -->

## Module: Autentikasi & Multi-Tenant

| Feature | Description | Priority | FE md | BE md | UI/UX md | QA md | DevOps md | Total |
|---|---|---|---|---|---|---|---|---|
| Registrasi tenant mandiri | Self-service signup, otomatis buat akun Admin | must | 2 | 3 | 1 | 1 | 0.5 | 7.5 |
| Login & manajemen sesi | Login Admin & Kasir, terikat ke satu tenant | must | 1.5 | 2 | 0.5 | 1 | 0 | 5 |
| Row Level Security & isolasi tenant | RLS Supabase berbasis tenant_id di semua tabel | must | 0 | 3 | 0 | 1.5 | 0.5 | 5 |
| Panel Super Admin | Monitoring daftar tenant terdaftar | should | 2 | 2 | 1 | 1 | 0 | 6 |

## Module: Manajemen Barang & Stok

| Feature | Description | Priority | FE md | BE md | UI/UX md | QA md | DevOps md | Total |
|---|---|---|---|---|---|---|---|---|
| CRUD barang | Nama, barcode, kategori, harga modal, harga jual, satuan | must | 3 | 2 | 1.5 | 1.5 | 0 | 8 |
| Toggle pelacakan stok | Opsi jual dengan/tanpa lacak stok per produk | must | 1 | 1 | 0.5 | 0.5 | 0 | 3 |
| Update stok otomatis | Stok berkurang otomatis dari transaksi | must | 0.5 | 2 | 0 | 1 | 0 | 3.5 |
| Insight low stock | Daftar/notifikasi barang stok rendah | should | 1.5 | 1 | 1 | 0.5 | 0 | 4 |
| Scan barcode saat tambah barang | Isi field barcode lewat kamera di form tambah/edit produk | should | 1.5 | 0 | 0.5 | 0.5 | 0 | 2.5 |
| Jaga integritas riwayat transaksi | FK transaction_items diubah SET NULL agar riwayat penjualan tetap ada meski barangnya dihapus | must | 0.5 | 1 | 0 | 0.5 | 0 | 2 |

## Module: Barang Titipan (Consignment)

| Feature | Description | Priority | FE md | BE md | UI/UX md | QA md | DevOps md | Total |
|---|---|---|---|---|---|---|---|---|
| CRUD data penitip | Nama, kontak penitip | must | 1.5 | 1.5 | 0.5 | 0.5 | 0 | 4 |
| Registrasi batch titipan | Titipan harian, qty, fee % (default 10%) | must | 2 | 2 | 1 | 1 | 0 | 6 |
| Perhitungan fee otomatis | Bagian penitip dihitung tiap barang terjual | must | 0 | 2.5 | 0 | 1.5 | 0 | 4 |
| Retur titipan tidak terjual | Kembalikan sisa stok titipan ke penitip | must | 1.5 | 1.5 | 0.5 | 1 | 0 | 4.5 |
| Rekap settlement titipan | Preview + finalisasi rekap per penitip/periode | must | 2.5 | 1.5 | 1.5 | 1 | 0 | 6.5 |
| Quick-add titipan dari list penitip | Tombol tambah titipan langsung di baris tabel penitip | should | 1 | 0 | 0.5 | 0.5 | 0 | 2 |
| Riwayat settlement + struk | Daftar settlement sudah direalisasi dengan badge status + lihat/cetak ulang struk | should | 2.5 | 0.5 | 1 | 1 | 0 | 5 |

## Module: Transaksi Kasir (POS)

| Feature | Description | Priority | FE md | BE md | UI/UX md | QA md | DevOps md | Total |
|---|---|---|---|---|---|---|---|---|
| UI kasir & scan barcode | USB scanner + kamera | must | 4 | 1 | 2 | 2 | 0 | 9 |
| Keranjang transaksi | Tambah/kurang item, kalkulasi total | must | 2 | 1 | 1 | 1 | 0 | 5 |
| Metode pembayaran | Tunai (+kembalian), QRIS, transfer (catatan) | must | 2 | 1.5 | 1 | 1 | 0 | 5.5 |
| Preview & cetak struk | Preview wajib, cetak opsional, format siap printer termal | should | 2 | 1 | 1 | 1 | 0 | 5 |

## Module: Laporan & Insight

| Feature | Description | Priority | FE md | BE md | UI/UX md | QA md | DevOps md | Total |
|---|---|---|---|---|---|---|---|---|
| Laporan penjualan | Per periode & metode pembayaran | must | 2.5 | 2 | 1 | 1 | 0 | 6.5 |
| Laporan laba kotor & bersih | Perhitungkan harga modal & fee titipan | must | 1.5 | 2 | 0.5 | 1 | 0 | 5 |
| Insight produk terlaris | Ranking penjualan per periode | should | 1.5 | 1.5 | 0.5 | 0.5 | 0 | 4 |
| Dashboard ringkasan | Ringkasan harian untuk Admin | should | 2 | 1 | 1.5 | 0.5 | 0 | 5 |

## Module: Offline-First & Sinkronisasi

| Feature | Description | Priority | FE md | BE md | UI/UX md | QA md | DevOps md | Total |
|---|---|---|---|---|---|---|---|---|
| Penyimpanan lokal (Dexie/IndexedDB) | Cache transaksi & master data saat offline | must | 3 | 0.5 | 0 | 1.5 | 0 | 5 |
| Antrian sinkronisasi otomatis | Push transaksi tertunda saat online kembali | must | 2 | 3 | 0.5 | 2 | 0 | 7.5 |
| Resolusi konflik data | Penanganan konflik saat sync (mis. stok berubah) | must | 1 | 3 | 0.5 | 2 | 0 | 6.5 |
| Service worker / PWA setup | App shell caching agar bisa dibuka offline | must | 2 | 0 | 0.5 | 1 | 1 | 4.5 |

## Module: Infrastruktur & Deployment

| Feature | Description | Priority | FE md | BE md | UI/UX md | QA md | DevOps md | Total |
|---|---|---|---|---|---|---|---|---|
| Setup project | Next.js + Supabase + Vercel | must | 0 | 0 | 0 | 0 | 2 | 2 |
| CI/CD pipeline dasar | Build & deploy otomatis dari git | should | 0 | 0 | 0 | 0 | 1.5 | 1.5 |
| Environment staging/production | Pemisahan environment Vercel & Supabase | should | 0 | 0 | 0 | 0.5 | 1.5 | 2 |

## Module: Peningkatan Kasir & Penitip (Phase 7)

| Feature | Description | Priority | FE md | BE md | UI/UX md | QA md | DevOps md | Total |
|---|---|---|---|---|---|---|---|---|
| Perbaikan performa navigasi | Hilangkan auth check ganda (middleware+layout), tambah loading.tsx per rute | should | 1.5 | 0.5 | 0 | 0.5 | 0 | 2.5 |

## Module: Billing & Subscription (Phase 8-11)

| Feature | Description | Priority | FE md | BE md | UI/UX md | QA md | DevOps md | Total |
|---|---|---|---|---|---|---|---|---|
| Field WA wajib saat registrasi | Nomor WhatsApp untuk follow-up manual platform | must | 0.5 | 0.5 | 0 | 0.5 | 0 | 1.5 |
| Verifikasi email registrasi | Kirim & validasi token via Mailgun, blokir login penuh sebelum verifikasi | must | 1 | 2 | 0.5 | 1 | 0.5 | 5 |
| Skema subscription & trial otomatis | Tabel `subscriptions`/`invoices`, trial 1 bulan otomatis saat registrasi | must | 0 | 3 | 0 | 1 | 0 | 4 |
| Generate tagihan bulanan | Hitung pendapatan bersih (margin + fee konsinyasi) per periode, buat invoice | must | 0 | 3 | 0 | 1.5 | 0 | 4.5 |
| Due date & grace period | Tracking jatuh tempo, transisi status invoice otomatis | must | 0 | 1.5 | 0 | 1 | 0 | 2.5 |
| Pembatasan akses POS | Guard akses Kasir/POS saat grace period habis, laporan tetap read-only | must | 1 | 1.5 | 0 | 1 | 0 | 3.5 |
| Integrasi Midtrans Snap | Create transaction dari invoice + redirect pembayaran | must | 0 | 2 | 0 | 1 | 0.5 | 3.5 |
| Webhook notifikasi Midtrans | Verifikasi signature, update status invoice idempotent | must | 0 | 2 | 0 | 1 | 0.5 | 3.5 |
| Dashboard tagihan tenant | Halaman billing Admin: tagihan berjalan, riwayat, status, tombol bayar | must | 2.5 | 0.5 | 1 | 1 | 0 | 5 |
| Super Admin: edit fee % per tenant | Lihat & ubah persentase fee untuk negosiasi | must | 1.5 | 1 | 0.5 | 0.5 | 0 | 3.5 |
| Super Admin: flag pembayaran manual | Tandai invoice lunas di luar sistem Midtrans | should | 1 | 1 | 0.5 | 0.5 | 0 | 3 |
| Super Admin: laporan piutang platform | Analisa pendapatan bersih semua tenant vs tagihan seharusnya | must | 2 | 2 | 0.5 | 1 | 0 | 5.5 |

## Totals

| Division | Total mandays |
|---|---|
| Frontend | 61 |
| Backend | 64.5 |
| UI/UX | 24 |
| QA | 42 |
| DevOps | 8.5 |
| **Grand total** | **200** |
