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
      <DialogTrigger render={<Button size="sm" />}>
        Tambah Titipan
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Titipan Barang</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            await formAction(formData);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="productName">Nama barang</Label>
            <Input id="productName" name="productName" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sellPrice">Harga jual</Label>
              <Input
                id="sellPrice"
                name="sellPrice"
                type="number"
                min={0}
                step="1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qtyReceived">Jumlah titip</Label>
              <Input
                id="qtyReceived"
                name="qtyReceived"
                type="number"
                min={1}
                step="1"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="feePercent">Fee toko (%)</Label>
              <Input
                id="feePercent"
                name="feePercent"
                type="number"
                min={0}
                max={100}
                step="1"
                defaultValue={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateReceived">Tanggal titip</Label>
              <Input
                id="dateReceived"
                name="dateReceived"
                type="date"
                defaultValue={todayIso()}
                required
              />
            </div>
          </div>
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
