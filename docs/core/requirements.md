# Requirements

## Objective

MitraTitip adalah aplikasi kasir (POS) berbasis web multi-tenant yang ditujukan untuk UMKM dan kantin sekolah. Aplikasi ini mendukung transaksi dengan barcode scanner, manajemen stok, sistem barang titipan (consignment) dengan fee otomatis, laporan penjualan dan insight bisnis, serta tetap dapat digunakan tanpa koneksi internet dengan sinkronisasi otomatis ke Supabase saat online kembali. Setiap toko/kantin yang mendaftar (tenant) bersifat mandiri dan datanya terisolasi sepenuhnya dari tenant lain.

## Users

<!-- Siapa saja pengguna aplikasi ini, dan kebutuhan masing-masing. -->
| Tipe pengguna | Kebutuhan |
|---|---|
| Super Admin (pemilik platform) | Memantau daftar tenant yang terdaftar lewat panel khusus; kelola persentase fee billing & status pembayaran per tenant; lihat laporan piutang platform |
| Admin/Pemilik (per tenant) | Kelola barang, stok, barang titipan, penitip, lihat laporan & insight, kelola akun kasir; lihat & bayar tagihan platform |
| Kasir (per tenant) | Melakukan transaksi penjualan, scan barcode, memilih metode pembayaran, preview/cetak struk |

## Functional requirements

<!-- Bernomor dan dapat diuji. Satu perilaku per item. -->
- **FR-1** — Admin dan Kasir dapat login dengan akun yang terikat ke satu tenant (toko)
- **FR-2** — Super Admin dapat login ke panel khusus untuk memantau daftar tenant terdaftar
- **FR-3** — Sistem mendukung pendaftaran tenant baru secara mandiri (self-service signup) yang otomatis membuat akun Admin untuk tenant tersebut
- **FR-4** — Admin dapat menambah, mengubah, dan menghapus data barang (nama, kode/barcode, kategori, harga modal, harga jual, satuan); menghapus barang tidak menghapus riwayat transaksi yang sudah terjadi (data penjualan lama tetap utuh meski barangnya sudah dihapus)
- **FR-4a** — Admin dapat mengisi kode barcode saat menambah/mengubah barang lewat scan kamera, selain input manual
- **FR-5** — Admin dapat menandai tiap barang sebagai "dilacak stok" atau "tidak dilacak stok"
- **FR-6** — Sistem memperbarui stok barang secara otomatis setiap ada transaksi penjualan, untuk barang yang dilacak stok
- **FR-7** — Kasir dapat mencari dan menambahkan barang ke transaksi dengan scan barcode, baik menggunakan USB scanner maupun kamera perangkat
- **FR-8** — Admin dapat mendaftarkan data penitip dan barang titipan, termasuk persentase fee (default 10%, dapat diubah per titipan); registrasi titipan dapat dilakukan langsung dari daftar penitip tanpa harus membuka halaman detail terlebih dahulu
- **FR-9** — Sistem mendukung barang titipan yang bersifat harian, dengan pencatatan tanggal barang diterima
- **FR-10** — Sistem menghitung otomatis bagian penitip (harga jual dikurangi fee) setiap kali barang titipan terjual
- **FR-11** — Admin dapat memproses retur barang titipan yang tidak terjual, mengembalikan sisa barang ke penitip
- **FR-12** — Sistem menghasilkan rekap settlement titipan per penitip untuk periode tertentu, dengan preview yang bisa dilihat sebelum dicetak (cetak bersifat opsional)
- **FR-12a** — Admin dapat melihat riwayat settlement yang sudah difinalisasi (ditandai status "Sudah Direalisasi") per penitip, serta melihat/mencetak ulang struknya kapan saja
- **FR-13** — Kasir dapat memproses transaksi dengan metode pembayaran tunai, QRIS, atau transfer bank, dicatat sebagai catatan kas/saldo per metode (bukan payment gateway)
- **FR-14** — Sistem menghitung kembalian otomatis untuk pembayaran tunai
- **FR-15** — Kasir dapat melihat preview struk sebelum transaksi selesai; cetak struk opsional dan default tanpa integrasi printer termal, namun format struk disiapkan untuk integrasi printer di masa depan
- **FR-16** — Admin dapat melihat laporan penjualan per periode, termasuk rincian per metode pembayaran (kas, QRIS, rekening)
- **FR-17** — Admin dapat melihat laporan laba kotor dan laba bersih, memperhitungkan harga modal dan fee titipan
- **FR-18** — Admin dapat melihat insight produk terlaris dalam periode tertentu
- **FR-19** — Sistem menampilkan daftar/notifikasi barang dengan stok rendah (low stock)
- **FR-20** — Aplikasi dapat digunakan secara offline; transaksi penjualan tetap dapat dilakukan tanpa koneksi internet
- **FR-21** — Sistem melakukan sinkronisasi otomatis data transaksi dan perubahan lain ke Supabase begitu koneksi internet tersedia kembali
- **FR-22** — Data antar tenant terisolasi sepenuhnya; satu tenant tidak dapat mengakses atau melihat data tenant lain
- **FR-23** — Pendaftaran tenant baru wajib mengisi nomor WhatsApp (untuk follow-up manual oleh platform) dan memverifikasi alamat email lewat tautan konfirmasi (dikirim via layanan email pihak ketiga) sebelum akun dapat digunakan
- **FR-24** — Setiap tenant mendapat trial gratis 1 bulan sejak tanggal pendaftaran, tanpa tagihan selama periode ini
- **FR-25** — Setelah trial berakhir, sistem menghasilkan tagihan bulanan otomatis sebesar persentase (default 2%, dapat diubah per tenant oleh Super Admin untuk negosiasi) dari **pendapatan bersih** toko pada periode tersebut — didefinisikan sebagai margin barang non-konsinyasi (harga jual dikurangi harga modal) ditambah bagian fee konsinyasi milik toko (`total_fee` pada settlement), **bukan** dari total omzet transaksi mentah
- **FR-26** — Jika tagihan tidak dibayar sampai jatuh tempo ditambah masa tenggang (grace period, dapat dikonfigurasi), sistem membatasi akses fitur transaksi (Kasir/POS) untuk Admin & Kasir tenant tersebut; data historis (laporan, riwayat transaksi & settlement) tetap dapat diakses secara read-only
- **FR-27** — Admin tenant dapat menyelesaikan pembayaran tagihan melalui Midtrans; status tagihan diperbarui otomatis lewat notifikasi webhook Midtrans
- **FR-28** — Admin tenant dapat melihat halaman tagihan (billing) berisi tagihan berjalan, riwayat pembayaran, dan status masing-masing
- **FR-29** — Super Admin dapat melihat dan mengubah persentase fee khusus per tenant (override dari nilai default)
- **FR-30** — Super Admin dapat menandai status pembayaran tenant secara manual per periode tagihan, sebagai fallback jika ada kesepakatan/pembayaran di luar sistem
- **FR-31** — Super Admin dapat melihat laporan analisa pendapatan bersih seluruh tenant, nilai tagihan yang seharusnya dibayarkan, dan status piutang platform secara keseluruhan

## Non-functional requirements

- **NFR-1** — Security: isolasi data antar tenant ditegakkan di level database (Row Level Security Supabase berbasis `tenant_id`)
- **NFR-2** — Usability: UI harus dapat dipahami dan dipakai oleh pengguna awam/gaptek tanpa pelatihan khusus — target kasir baru bisa menyelesaikan transaksi pertama dalam < 5 menit tanpa panduan tertulis
- **NFR-3** — Reliability: transaksi yang dibuat saat offline tidak boleh hilang; proses sinkronisasi harus idempotent dan aman terhadap koneksi terputus di tengah proses
- **NFR-4** — Performance: pencarian barang via scan barcode merespons dalam < 300ms agar alur kasir tetap cepat
- **NFR-5** — Compatibility: aplikasi berjalan baik di browser desktop (laptop) maupun tablet layar sentuh
- **NFR-6** — Performance: perpindahan antar halaman dashboard tidak boleh terasa freeze; hindari pengecekan autentikasi berulang per navigasi dan tampilkan feedback loading instan
- **NFR-7** — Security: kredensial pihak ketiga (Midtrans, Mailgun) disimpan sebagai environment variable, tidak pernah hardcoded; setiap notifikasi webhook Midtrans diverifikasi signature-nya sebelum status tagihan diproses
- **NFR-8** — Reliability: pembatasan akses akibat tagihan menunggak tidak boleh menghapus atau mengunci data historis tenant — hanya membatasi aksi transaksi baru (Kasir/POS)

## Out of scope

- Multi-cabang/multi-lokasi dalam satu tenant (saat ini 1 tenant = 1 toko/kantin)
- Integrasi payment gateway untuk transaksi Kasir/POS (metode QRIS/transfer pada transaksi penjualan tenant tetap dicatat manual, bukan diproses/diverifikasi otomatis) — Midtrans pada fase ini **hanya** dipakai untuk pembayaran tagihan platform ke tenant, bukan transaksi jual-beli tenant ke pembeli
- Integrasi printer termal aktif (hanya format struk yang disiapkan, implementasi integrasi ditunda)
- Manajemen tenant lanjutan di luar konteks billing (mis. suspend manual tanpa alasan tagihan, paket/tier berjenjang selain persentase fee) — restriksi akses otomatis berbasis status tagihan termasuk dalam scope, di luar itu tidak
- Aplikasi native mobile (Android/iOS) — hanya web app/PWA yang diakses lewat browser
- Verifikasi nomor WhatsApp otomatis (OTP) — nomor WA hanya dikumpulkan sebagai data kontak untuk follow-up manual, karena API WA resmi berbayar
