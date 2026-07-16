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
      <DialogTrigger
        render={<Button variant={consignor ? "outline" : "default"} size="sm" />}
      >
        {consignor ? "Edit" : "Tambah Penitip"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{consignor ? "Edit Penitip" : "Tambah Penitip"}</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            await formAction(formData);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nama penitip</Label>
            <Input id="name" name="name" defaultValue={consignor?.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telepon</Label>
            <Input id="phone" name="phone" defaultValue={consignor?.phone ?? ""} />
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
