"use client";

import { useActionState, useState } from "react";
import {
  createConsignor,
  updateConsignor,
  type ActionState,
} from "./actions";
import type { Consignor } from "@/lib/types/consignor";
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

const initialState: ActionState = { error: null };

export function ConsignorDialog({ consignor }: { consignor?: Consignor }) {
  const [open, setOpen] = useState(false);
  const action = consignor
    ? updateConsignor.bind(null, consignor.id)
    : createConsignor;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={consignor ? "ghost" : "default"} 
          size={consignor ? "sm" : "default"} 
          className={consignor ? "font-bold text-xs uppercase tracking-wider" : "font-black uppercase tracking-widest rounded-2xl h-12 px-6"}
        >
          {consignor ? "Edit" : "Tambah Penitip"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-background">
        <div className="bg-gradient-to-b from-primary/10 to-transparent px-8 py-8 relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <DialogHeader>
            <DialogTitle className="text-3xl font-extrabold tracking-tight text-foreground">
              {consignor ? "Edit Penitip" : "Mitra Baru"}
            </DialogTitle>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              {consignor ? "Perbarui informasi kontak mitra penitip ini." : "Masukkan informasi kontak mitra penitip (consignor) baru."}
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
            <Label htmlFor="name" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-2">Nama Penitip</Label>
            <Input 
              id="name" 
              name="name" 
              defaultValue={consignor?.name} 
              required 
              placeholder="Cth: Budi Bakery"
              className="h-14 rounded-2xl bg-muted/40 border-none px-6 text-base font-bold shadow-none focus-visible:ring-primary/50 focus-visible:bg-primary/[0.02] transition-colors" 
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-2">Nomor Telepon</Label>
            <Input 
              id="phone" 
              name="phone" 
              defaultValue={consignor?.phone ?? ""} 
              placeholder="Cth: 08123456789"
              className="h-14 rounded-2xl bg-muted/40 border-none px-6 text-base font-bold shadow-none focus-visible:ring-primary/50 focus-visible:bg-primary/[0.02] transition-colors" 
            />
          </div>
          
          {state.error && (
            <div className="rounded-xl bg-destructive/10 p-3 ring-1 ring-destructive/20">
              <p className="text-center text-xs font-bold text-destructive">{state.error}</p>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="h-16 w-full rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98]" 
            disabled={isPending}
          >
            {isPending ? "Menyimpan..." : "Simpan Penitip"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
