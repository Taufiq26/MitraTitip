"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const res = await fetch("/api/tenants/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_name: formData.get("tenant_name"),
        admin_email: formData.get("admin_email"),
        admin_password: formData.get("admin_password"),
        admin_name: formData.get("admin_name"),
      }),
    });
    const json = await res.json();
    setIsPending(false);

    if (!json.success) {
      setError(json.error ?? "Gagal mendaftar, coba lagi.");
      return;
    }

    router.push("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Daftarkan Toko Anda</CardTitle>
          <CardDescription>
            Buat akun Admin untuk toko/kantin Anda di MitraTitip.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tenant_name">Nama toko/kantin</Label>
              <Input id="tenant_name" name="tenant_name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_name">Nama Anda</Label>
              <Input id="admin_name" name="admin_name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_email">Email</Label>
              <Input
                id="admin_email"
                name="admin_email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_password">Password</Label>
              <Input
                id="admin_password"
                name="admin_password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Mendaftarkan..." : "Daftar"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <a href="/login" className="underline underline-offset-4">
              Masuk di sini
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
