"use client";

import { useState, useTransition } from "react";
import { returnConsignmentBatch } from "../actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ReturnBatchButton({
  batchId,
  consignorId,
}: {
  batchId: string;
  consignorId: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="font-bold text-[10px] uppercase tracking-wider text-foreground border-border shadow-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all px-4 rounded-lg"
        >
          Retur Sisa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] p-8 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-background [&>button]:hidden flex flex-col items-center text-center">
        
        {/* Package Return Icon */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-2">
          <svg className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
          </svg>
        </div>
        
        <DialogHeader className="text-center w-full">
          <DialogTitle className="text-3xl font-extrabold tracking-tight text-foreground text-center">
            Retur Sisa?
          </DialogTitle>
        </DialogHeader>
        
        <p className="text-[15px] font-medium text-muted-foreground mt-3 mb-8 px-2 leading-relaxed">
          Anda akan <strong className="font-black text-foreground">mengembalikan</strong> semua sisa barang titipan ini ke penitip. Status titipan akan menjadi selesai.
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
            className="h-14 flex-1 rounded-2xl bg-primary text-primary-foreground text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30 active:scale-[0.98]"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                await returnConsignmentBatch(batchId, consignorId);
                setOpen(false);
              });
            }}
          >
            {isPending ? "Memproses..." : "Ya, Retur!"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
