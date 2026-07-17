"use client";

import { useActionState, useState } from "react";
import {
  createProduct,
  updateProduct,
  type ProductActionState,
} from "./actions";
import type { Product } from "@/lib/types/product";
import { BarcodeCameraDialog } from "@/app/dashboard/pos/barcode-camera-dialog";
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

const initialState: ProductActionState = { error: null };

export function ProductDialog({ product }: { product?: Product }) {
  const [open, setOpen] = useState(false);
  const action = product
    ? updateProduct.bind(null, product.id)
    : createProduct;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [trackStock, setTrackStock] = useState(product?.trackStock ?? true);
  const [barcode, setBarcode] = useState(product?.barcode ?? "");
  const [cameraOpen, setCameraOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant={product ? "outline" : "default"} size="sm" />}
      >
        {product ? "Edit" : "Tambah Produk"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? "Edit Produk" : "Tambah Produk"}</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            await formAction(formData);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nama barang</Label>
            <Input id="name" name="name" defaultValue={product?.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
            <div className="flex gap-2">
              <Input
                id="barcode"
                name="barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setCameraOpen(true)}
              >
                Scan
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Input id="category" name="category" defaultValue={product?.category ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costPrice">Harga modal</Label>
              <Input
                id="costPrice"
                name="costPrice"
                type="number"
                min={0}
                step="1"
                defaultValue={product?.costPrice ?? 0}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellPrice">Harga jual</Label>
              <Input
                id="sellPrice"
                name="sellPrice"
                type="number"
                min={0}
                step="1"
                defaultValue={product?.sellPrice ?? 0}
                required
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="trackStock"
              name="trackStock"
              type="checkbox"
              checked={trackStock}
              onChange={(e) => setTrackStock(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="trackStock">Lacak stok untuk barang ini</Label>
          </div>
          {trackStock && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stockQty">Stok saat ini</Label>
                <Input
                  id="stockQty"
                  name="stockQty"
                  type="number"
                  min={0}
                  step="1"
                  defaultValue={product?.stockQty ?? 0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Batas stok rendah</Label>
                <Input
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  type="number"
                  min={0}
                  step="1"
                  defaultValue={product?.lowStockThreshold ?? ""}
                />
              </div>
            </div>
          )}
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </form>
      </DialogContent>
      <BarcodeCameraDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onScan={setBarcode}
      />
    </Dialog>
  );
}
