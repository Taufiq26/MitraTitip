"use client";

import { useActionState, useState, useEffect } from "react";
import { createKasir } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const initialState = { success: false, error: null };

export function UserDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createKasir, initialState);

  // Close dialog on success
  useEffect(() => {
    if (state.success && open) {
      setOpen(false);
      state.success = false; // Reset for next time
    }
  }, [state, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-black uppercase tracking-widest rounded-2xl h-12 px-6 shadow-sm hover:scale-105 transition-transform">
          Tambah Kasir
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-[2rem] border-foreground/5 bg-background p-8 shadow-2xl">
        <DialogHeader className="mb-6 space-y-2">
          <DialogTitle className="text-2xl font-extrabold tracking-tight">
            Tambah Kasir Baru
          </DialogTitle>
          <p className="text-sm font-medium text-muted-foreground">
            Kasir memiliki akses ke fitur operasional (Kasir, Barang, Penitip, Settlement).
          </p>
        </DialogHeader>

        <form action={formAction} className="space-y-6">
          {state.error && (
            <div className="rounded-2xl bg-destructive/10 p-4 text-sm font-bold text-destructive ring-1 ring-destructive/20">
              {state.error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Nama Lengkap
              </Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Masukkan nama"
                required
                className="h-12 rounded-xl border-foreground/10 bg-muted/50 px-4 font-medium transition-all focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Masukkan email"
                required
                className="h-12 rounded-xl border-foreground/10 bg-muted/50 px-4 font-medium transition-all focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Minimal 6 karakter"
                required
                className="h-12 rounded-xl border-foreground/10 bg-muted/50 px-4 font-medium transition-all focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Nomor HP (Opsional)
              </Label>
              <Input
                id="phone"
                name="phone"
                placeholder="08123456789"
                className="h-12 rounded-xl border-foreground/10 bg-muted/50 px-4 font-medium transition-all focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Alamat Tinggal (Opsional)
              </Label>
              <Input
                id="address"
                name="address"
                placeholder="Masukkan alamat lengkap"
                className="h-12 rounded-xl border-foreground/10 bg-muted/50 px-4 font-medium transition-all focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="h-12 rounded-2xl px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className={cn(
                "h-12 rounded-2xl px-8 text-xs font-bold uppercase tracking-widest shadow-md transition-all",
                isPending ? "opacity-70" : "hover:scale-105"
              )}
            >
              {isPending ? "Menyimpan..." : "Simpan Kasir"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
