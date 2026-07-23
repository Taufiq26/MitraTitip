"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const adminEmail = String(formData.get("admin_email") ?? "");
    const res = await fetch("/api/tenants/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_name: formData.get("tenant_name"),
        admin_email: adminEmail,
        admin_password: formData.get("admin_password"),
        admin_name: formData.get("admin_name"),
        whatsapp_number: formData.get("whatsapp_number"),
      }),
    });
    const json = await res.json();
    setIsPending(false);

    if (!json.success) {
      setError(json.error ?? "Gagal mendaftar, coba lagi.");
      return;
    }

    router.push(`/register/check-email?email=${encodeURIComponent(adminEmail)}`);
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[400px_1fr] xl:grid-cols-[500px_1fr]">
      {/* Brand Panel (Hidden on mobile) */}
      <div className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex flex-col justify-center">
        {/* Ambient CSS glow effects for depth */}
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/20 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-black/5 blur-3xl"></div>
        
        <div className="relative z-10 max-w-xl space-y-6">
          <h1 className="text-[clamp(4rem,8vw,7rem)] font-black leading-[0.9] tracking-tighter">
            Mitra<br />Titip<span className="text-white">.</span>
          </h1>
          <p className="max-w-md text-2xl font-medium leading-snug opacity-90">
            Asisten Toko yang Ramah & Rapi.
          </p>
        </div>
        <div className="absolute bottom-12 left-12 z-10 opacity-80">
          <p className="text-sm">&copy; {new Date().getFullYear()} MitraTitip. Hak cipta dilindungi.</p>
        </div>
      </div>

      {/* Action Panel */}
      <div className="flex flex-col justify-center bg-background p-8 sm:p-12 lg:p-16 xl:p-24">
        <div className="mx-auto w-full max-w-[400px] xl:max-w-[900px]">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_380px] xl:gap-x-16 xl:gap-y-10">
            
            <div className="space-y-8">
              <div className="space-y-1.5">
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Daftarkan Toko Anda.</h2>
                <p className="text-base text-muted-foreground">
                  Buat akun Admin untuk mulai mengelola MitraTitip.
                </p>
              </div>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tenant_name" className="text-sm font-medium text-foreground">Nama Toko / Kantin</Label>
                    <Input 
                      id="tenant_name" 
                      name="tenant_name" 
                      required 
                      className="h-12 bg-background text-base shadow-sm md:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin_name" className="text-sm font-medium text-foreground">Nama Anda</Label>
                    <Input 
                      id="admin_name" 
                      name="admin_name" 
                      required 
                      className="h-12 bg-background text-base shadow-sm md:text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp_number" className="text-sm font-medium text-foreground">Nomor WhatsApp</Label>
                  <Input
                    id="whatsapp_number"
                    name="whatsapp_number"
                    type="tel"
                    autoComplete="tel"
                    placeholder="081234567890"
                    required
                    className="h-12 bg-background text-base shadow-sm md:text-base"
                  />
                  <p className="text-xs text-muted-foreground">Dipakai tim kami untuk follow-up terkait akun Anda.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_email" className="text-sm font-medium text-foreground">Email</Label>
                  <Input
                    id="admin_email"
                    name="admin_email"
                    type="email"
                    autoComplete="email"
                    required
                    className="h-12 bg-background text-base shadow-sm md:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_password" className="text-sm font-medium text-foreground">Password</Label>
                  <Input
                    id="admin_password"
                    name="admin_password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="h-12 bg-background text-base shadow-sm md:text-base"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="space-y-4 rounded-xl border bg-muted/30 p-5 text-sm leading-relaxed text-muted-foreground">
                <p className="font-semibold text-foreground">Syarat &amp; Ketentuan Penggunaan</p>
                <ul className="list-disc space-y-2 pl-4 marker:text-muted-foreground">
                  <li><strong className="font-semibold text-foreground">30 hari pertama gratis</strong> — masa trial penuh tanpa biaya apa pun.</li>
                  <li>Setelah trial berakhir, dikenakan biaya langganan <strong className="font-semibold text-foreground">2% per bulan dari pendapatan bersih toko</strong> (margin penjualan + komisi konsinyasi milik toko, <em>bukan</em> dari total omzet). Persentase dapat dinegosiasikan untuk skala besar via WhatsApp.</li>
                  <li>Tagihan dihitung otomatis tiap akhir periode dan dapat dibayar langsung lewat Midtrans.</li>
                  <li>Jika tagihan tidak dibayar hingga masa tenggang, akses fitur Kasir dibatasi sementara. Data &amp; riwayat transaksi Anda tetap aman.</li>
                </ul>
                <label className="flex items-start gap-3 pt-2">
                  <input type="checkbox" name="agree_terms" required className="mt-0.5 h-5 w-5 shrink-0 accent-primary" />
                  <span className="font-medium text-foreground">Saya membaca dan menyetujui ketentuan di atas.</span>
                </label>
              </div>
            </div>

            <div className="space-y-4 pt-2 xl:col-span-2 xl:pt-0">
              {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}
              <Button type="submit" className="h-12 w-full text-base font-bold shadow-sm transition-transform active:scale-[0.98]" disabled={isPending}>
                {isPending ? "Mendaftarkan..." : "Buat Akun"}
              </Button>
              
              <p className="text-center text-base text-muted-foreground">
                Sudah punya akun?{" "}
                <Link href="/login" className="font-medium text-foreground transition-colors hover:text-primary underline underline-offset-4">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
