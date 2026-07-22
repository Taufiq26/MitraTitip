# Tech Stack

<!-- Setiap pilihan disertai alasan; alternatif yang ditolak dicatat agar tidak dibahas ulang. -->

| Layer | Choice | Version | Reasoning |
|---|---|---|---|
| Framework frontend | Next.js (React) | 14.x | App Router, hybrid SSR/SSG, deploy native ke Vercel |
| Bahasa | TypeScript | 5.x | Type safety untuk logika transaksi, stok, dan fee titipan yang kritikal |
| Styling/UI | Tailwind CSS + shadcn/ui | latest | UI konsisten dan estetik tanpa membangun design system dari nol, mudah dikustomisasi untuk pengguna awam |
| Backend/Database | Supabase (Postgres + Auth + Realtime) | latest | Sesuai permintaan; Row Level Security bawaan cocok untuk isolasi data multi-tenant |
| Penyimpanan offline | Dexie.js (wrapper IndexedDB) | latest | Penyimpanan lokal terstruktur untuk transaksi & master data saat aplikasi offline |
| PWA / Service Worker | next-pwa (Workbox) | latest | Caching app shell & aset statis agar aplikasi tetap terbuka dan bisa dipakai saat offline |
| Barcode scanning | html5-qrcode / ZXing-js (kamera) + input keyboard native (USB scanner) | latest | Mendukung dua jenis scanner tanpa perangkat tambahan; USB scanner terbaca sebagai keyboard input tanpa driver khusus |
| State & sync management | TanStack Query + custom sync queue | latest | Mengelola cache data di client serta antrian sinkronisasi transaksi ke Supabase |
| Payment gateway (billing platform) | Midtrans (Snap API) | latest | Untuk pembayaran tagihan langganan tenant ke platform (bukan transaksi Kasir/POS tenant); Snap API menyediakan halaman pembayaran siap pakai + webhook notifikasi, cocok untuk MVP tanpa perlu bangun UI pembayaran sendiri |
| Transactional email | Mailgun | latest | Verifikasi email saat registrasi tenant; free tier tersedia dan reputasi pengirim lebih baik daripada SMTP mandiri sehingga email tidak masuk folder spam |
| Deployment | Vercel | - | Sesuai permintaan, terintegrasi baik dengan Next.js (preview deployment, edge network) |

## Alternatives considered

| Option | Rejected because |
|---|---|
| Firebase (Firestore + Auth) | User sudah menentukan Supabase sebagai database |
| Aplikasi native mobile (React Native/Flutter) | Cukup web app/PWA agar bisa diakses langsung dari browser laptop & tablet tanpa instalasi |
| ElectricSQL / PowerSync untuk offline sync | Dipertimbangkan untuk fase lanjut jika sync queue custom tidak cukup skalabel; untuk MVP cukup Dexie + antrian sinkronisasi manual |
| Payment gateway untuk transaksi Kasir/POS (Midtrans/Xendit sebagai payment processor pembeli) | Tidak dibutuhkan — tenant hanya perlu pencatatan manual per metode pembayaran pembeli, bukan pemrosesan otomatis. Midtrans yang dipakai di stack ini scope-nya berbeda: pembayaran tagihan tenant ke platform, bukan transaksi jual-beli tenant |
| WhatsApp Business API resmi (verifikasi OTP nomor WA) | Berbayar; untuk MVP nomor WA cukup dikumpulkan sebagai data kontak follow-up manual, tanpa verifikasi otomatis |
