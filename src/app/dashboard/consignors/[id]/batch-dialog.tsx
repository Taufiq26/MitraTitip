"use client";

import { useActionState, useState } from "react";
import { createConsignmentBatch } from "../actions";
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

const initialState = { error: null as string | null };

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function BatchDialog({ consignorId }: { consignorId: string }) {
  const [open, setOpen] = useState(false);
  const action = createConsignmentBatch.bind(null, consignorId);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 px-5 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-md hover:shadow-lg transition-all">
          Tambah Titipan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-background">
        <div className="bg-gradient-to-b from-primary/10 to-transparent px-8 py-8 relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <DialogHeader>
            <DialogTitle className="text-3xl font-extrabold tracking-tight text-foreground">
              Tambah Titipan
            </DialogTitle>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              Catat barang titipan baru dari mitra ini ke dalam sistem.
            </p>
          </DialogHeader>
        </div>
        <form
          action={async (formData) => {
            await formAction(formData);
            setOpen(false);
          }}
          className="px-8 pb-8 space-y-6"
        >
          <div className="space-y-1.5">
            <Label htmlFor="productName" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-2">Nama Barang</Label>
            <Input 
              id="productName" 
              name="productName" 
              required 
              placeholder="Cth: Keripik Pisang 100gr"
              className="h-14 rounded-2xl bg-muted/40 border-none px-6 text-base font-bold shadow-none focus-visible:ring-primary/50 focus-visible:bg-primary/[0.02] transition-colors"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sellPrice" className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">Harga Jual (Rp)</Label>
              <Input
                id="sellPrice"
                name="sellPrice"
                type="number"
                min={0}
                step="1"
                required
                placeholder="Cth: 15000"
                className="h-14 rounded-2xl bg-primary/10 text-primary border-none px-6 text-lg font-black shadow-none focus-visible:ring-primary/50 focus-visible:bg-primary/20 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qtyReceived" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-2">Jumlah Titip</Label>
              <Input
                id="qtyReceived"
                name="qtyReceived"
                type="number"
                min={1}
                step="1"
                required
                placeholder="Cth: 10"
                className="h-14 rounded-2xl bg-muted/40 border-none px-6 text-lg font-black shadow-none focus-visible:ring-primary/50 transition-colors"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="feePercent" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Fee Toko (%)</Label>
              <Input
                id="feePercent"
                name="feePercent"
                type="number"
                min={0}
                max={100}
                step="1"
                defaultValue={10}
                className="h-12 rounded-xl bg-muted/40 border-none px-5 text-sm font-black shadow-none focus-visible:ring-primary/50 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dateReceived" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Tanggal Titip</Label>
              <Input
                id="dateReceived"
                name="dateReceived"
                type="date"
                defaultValue={todayIso()}
                required
                className="h-12 rounded-xl bg-muted/40 border-none px-5 text-sm font-bold shadow-none focus-visible:ring-primary/50 transition-colors cursor-pointer"
              />
            </div>
          </div>
          
          {state.error && (
            <div className="rounded-xl bg-destructive/10 p-3 ring-1 ring-destructive/20">
              <p className="text-center text-xs font-bold text-destructive">{state.error}</p>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="h-16 w-full rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98] mt-2" 
            disabled={isPending}
          >
            {isPending ? "Menyimpan..." : "Simpan Titipan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
