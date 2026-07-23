import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  ScanBarcode,
  PackageSearch,
  LineChart,
  WifiOff,
  Users,
  ShieldCheck,
  Check,
} from "lucide-react";

const FEATURES = [
  {
    icon: ScanBarcode,
    title: "Kasir Cepat & Scan Barcode",
    description: "Transaksi tunai, QRIS, atau transfer dalam hitungan detik. Scan pakai USB scanner atau kamera HP, tanpa alat tambahan.",
  },
  {
    icon: PackageSearch,
    title: "Barang Titipan (Konsinyasi)",
    description: "Kelola penitip, fee otomatis per barang terjual, dan settlement rapi tanpa hitung manual.",
  },
  {
    icon: LineChart,
    title: "Laporan & Insight Bisnis",
    description: "Laba kotor & bersih, produk terlaris, dan ringkasan harian — semua otomatis terhitung dari transaksi Anda.",
  },
  {
    icon: WifiOff,
    title: "Tetap Jalan Tanpa Internet",
    description: "Transaksi tetap tercatat saat offline dan tersinkron otomatis begitu koneksi kembali.",
  },
  {
    icon: Users,
    title: "Multi Pengguna",
    description: "Pisahkan akun Admin dan Kasir, masing-masing dengan akses yang sesuai perannya.",
  },
  {
    icon: ShieldCheck,
    title: "Data Aman & Terisolasi",
    description: "Setiap toko punya data terpisah sepenuhnya, tersimpan aman di database dengan Row Level Security.",
  },
];

const PRICING_POINTS = [
  "30 hari pertama gratis penuh, tanpa kartu kredit",
  "Setelah itu, 2% per bulan dari pendapatan bersih toko — bukan dari omzet kotor",
  "Tidak menghitung uang milik penitip barang, hanya margin & komisi milik toko Anda",
  "Persentase bisa dinegosiasikan untuk toko dengan skala besar",
  "Tidak bayar? Data Anda tetap aman, hanya fitur Kasir yang dijeda sementara",
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    redirect(profile?.role === "super_admin" ? "/super-admin" : "/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-foreground/5 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <p className="text-xl font-extrabold tracking-tighter">MitraTitip.</p>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#fitur" className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">Fitur</a>
            <a href="#harga" className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">Harga</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-sm font-bold">Masuk</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="text-sm font-bold shadow-sm">Daftar Gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
          <div className="relative w-full max-w-6xl">
            <div className="absolute -top-20 -left-10 h-[40rem] w-[40rem] rounded-full bg-primary/20 blur-[120px]" />
            <div className="absolute -bottom-20 right-0 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-[120px]" />
          </div>
        </div>

        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
          <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] font-black leading-[0.95] tracking-tighter">
            Asisten Toko yang<br />Ramah &amp; Rapi.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg font-medium text-muted-foreground">
            Kasir, stok, dan barang titipan dalam satu aplikasi sederhana — dibuat untuk UMKM dan kantin sekolah, bukan perusahaan besar.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-base font-bold shadow-md">Daftarkan Toko Anda</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base font-bold">Sudah Punya Akun</Button>
            </Link>
          </div>
          <p className="mt-4 text-sm font-medium text-muted-foreground">Gratis 30 hari pertama, tanpa kartu kredit.</p>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Semua yang toko Anda butuhkan</h2>
          <p className="mt-3 text-muted-foreground">Tanpa fitur berlebihan yang bikin bingung.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-3xl bg-background p-6 shadow-sm ring-1 ring-foreground/5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="harga" className="bg-muted/30 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Harga yang adil, tumbuh bareng Anda</h2>
            <p className="mt-3 text-muted-foreground">Kami hanya untung kalau toko Anda juga untung.</p>
          </div>

          <div className="rounded-[2rem] bg-background p-8 shadow-sm ring-1 ring-foreground/5 sm:p-10">
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-sm font-bold uppercase tracking-widest text-primary">Trial 30 Hari</span>
              <span className="text-5xl font-black tracking-tighter">Gratis</span>
              <span className="text-sm text-muted-foreground">lalu 2% per bulan dari pendapatan bersih</span>
            </div>

            <ul className="mx-auto mt-8 max-w-md space-y-3">
              {PRICING_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm font-medium text-foreground/80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {point}
                </li>
              ))}
            </ul>

            <Link href="/register" className="mt-8 block">
              <Button size="lg" className="h-14 w-full text-base font-bold shadow-md">Mulai Gratis Sekarang</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-foreground/5 pt-8 text-sm text-muted-foreground sm:flex-row">
          <p className="font-bold tracking-tighter text-foreground">MitraTitip.</p>
          <p>&copy; {new Date().getFullYear()} MitraTitip. Hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
