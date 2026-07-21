"use client";

import { useState, useTransition } from "react";
import { deleteConsignor } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteConsignorButton({ consignorId }: { consignorId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="font-bold text-xs uppercase tracking-wider text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          Hapus
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] p-8 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-background [&>button]:hidden flex flex-col items-center text-center">
        
        {/* Massive Warning Icon */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10 mb-2">
          <svg className="h-12 w-12 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <DialogHeader className="text-center w-full">
          <DialogTitle className="text-3xl font-extrabold tracking-tight text-foreground text-center">
            Hapus Penitip?
          </DialogTitle>
        </DialogHeader>
        
        <p className="text-[15px] font-medium text-muted-foreground mt-3 mb-8 px-2 leading-relaxed">
          Semua data titipan dari mitra ini akan <strong className="font-black text-foreground">hilang permanen</strong>. Tindakan ini tidak dapat dibatalkan.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            type="button"
            variant="secondary"
            className="h-14 flex-1 rounded-2xl font-bold uppercase tracking-wider text-sm hover:bg-muted"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            type="button"
            className="h-14 flex-1 rounded-2xl bg-destructive text-destructive-foreground text-sm font-black uppercase tracking-widest shadow-xl shadow-destructive/20 transition-all hover:bg-destructive/90 hover:shadow-destructive/30 active:scale-[0.98]"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                await deleteConsignor(consignorId);
                setOpen(false);
              });
            }}
          >
            {isPending ? "Menghapus..." : "Ya, Hapus"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
