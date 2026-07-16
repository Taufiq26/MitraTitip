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

## Module: Barang Titipan (Consignment)

| Feature | Description | Priority | FE md | BE md | UI/UX md | QA md | DevOps md | Total |
|---|---|---|---|---|---|---|---|---|
| CRUD data penitip | Nama, kontak penitip | must | 1.5 | 1.5 | 0.5 | 0.5 | 0 | 4 |
| Registrasi batch titipan | Titipan harian, qty, fee % (default 10%) | must | 2 | 2 | 1 | 1 | 0 | 6 |
| Perhitungan fee otomatis | Bagian penitip dihitung tiap barang terjual | must | 0 | 2.5 | 0 | 1.5 | 0 | 4 |
| Retur titipan tidak terjual | Kembalikan sisa stok titipan ke penitip | must | 1.5 | 1.5 | 0.5 | 1 | 0 | 4.5 |
| Rekap settlement titipan | Preview + finalisasi rekap per penitip/periode | must | 2.5 | 1.5 | 1.5 | 1 | 0 | 6.5 |

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

## Totals

| Division | Total mandays |
|---|---|
| Frontend | 44.5 |
| Backend | 42.5 |
| UI/UX | 19 |
| QA | 28 |
| DevOps | 7 |
| **Grand total** | **141** |
