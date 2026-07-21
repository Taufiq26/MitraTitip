"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Brand Panel (Hidden on mobile) */}
      <div className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex flex-col justify-center">
        {/* Ambient CSS glow effects for depth */}
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/20 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-black/5 blur-3xl"></div>
        
        <div className="relative z-10 space-y-6 max-w-xl">
          <h1 className="text-[clamp(4rem,8vw,7rem)] font-black leading-[0.9] tracking-tighter">
            Mitra<br />Titip<span className="text-white">.</span>
          </h1>
          <p className="text-2xl font-medium leading-snug opacity-90 max-w-md">
            Asisten Toko yang Ramah & Rapi.
          </p>
        </div>
        <div className="absolute z-10 bottom-12 left-12 opacity-80">
          <p className="text-sm">&copy; {new Date().getFullYear()} MitraTitip. Hak cipta dilindungi.</p>
        </div>
      </div>

      {/* Action Panel */}
      <div className="flex flex-col justify-center bg-background p-8 sm:p-12 lg:px-24">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="space-y-1.5">
            <h2 className="text-3xl font-extrabold tracking-tight">Selamat datang kembali.</h2>
            <p className="text-base text-muted-foreground">
              Silakan masuk ke akun Anda untuk mulai melayani.
            </p>
          </div>
          
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="h-12 bg-muted/20 text-base transition-colors focus-visible:bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="h-12 bg-muted/20 text-base transition-colors focus-visible:bg-transparent"
              />
            </div>
            {state.error && (
              <p className="text-sm font-medium text-destructive">{state.error}</p>
            )}
            <div className="pt-4">
              <Button type="submit" className="h-12 w-full text-base font-bold shadow-sm" disabled={isPending}>
                {isPending ? "Memproses..." : "Masuk ke Sistem"}
              </Button>
            </div>
          </form>
          
          <p className="text-center text-base text-muted-foreground">
            Toko baru?{" "}
            <Link href="/register" className="font-medium text-foreground/70 transition-colors hover:text-foreground underline underline-offset-4">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
