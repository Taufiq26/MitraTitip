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
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
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
      <div className="flex flex-col justify-center bg-background p-8 sm:p-12 lg:px-24">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="space-y-1.5">
            <h2 className="text-3xl font-extrabold tracking-tight">Daftarkan Toko Anda.</h2>
            <p className="text-base text-muted-foreground">
              Buat akun Admin untuk mulai mengelola MitraTitip.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tenant_name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Toko/Kantin</Label>
              <Input 
                id="tenant_name" 
                name="tenant_name" 
                required 
                className="h-12 bg-muted/20 text-base transition-colors focus-visible:bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Anda</Label>
              <Input 
                id="admin_name" 
                name="admin_name" 
                required 
                className="h-12 bg-muted/20 text-base transition-colors focus-visible:bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nomor WhatsApp</Label>
              <Input
                id="whatsapp_number"
                name="whatsapp_number"
                type="tel"
                autoComplete="tel"
                placeholder="081234567890"
                required
                className="h-12 bg-muted/20 text-base transition-colors focus-visible:bg-transparent"
              />
              <p className="text-xs text-muted-foreground">Dipakai tim kami untuk follow-up terkait akun Anda.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input
                id="admin_email"
                name="admin_email"
                type="email"
                autoComplete="email"
                required
                className="h-12 bg-muted/20 text-base transition-colors focus-visible:bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
              <Input
                id="admin_password"
                name="admin_password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className="h-12 bg-muted/20 text-base transition-colors focus-visible:bg-transparent"
              />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <div className="pt-4">
              <Button type="submit" className="h-12 w-full text-base font-bold shadow-sm" disabled={isPending}>
                {isPending ? "Mendaftarkan..." : "Buat Akun"}
              </Button>
            </div>
          </form>
          
          <p className="text-center text-base text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-medium text-foreground/70 transition-colors hover:text-foreground underline underline-offset-4">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
