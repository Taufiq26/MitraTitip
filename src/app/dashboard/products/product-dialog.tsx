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

export function ProductDialog({ product, triggerText, triggerVariant }: { product?: Product; triggerText?: string; triggerVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" }) {
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
      <DialogTrigger asChild>
        <Button 
          variant={triggerVariant || (product ? "ghost" : "default")} 
          size={product ? "sm" : "default"} 
          className={product ? "font-bold text-xs uppercase tracking-wider" : "font-black uppercase tracking-widest rounded-2xl h-12 px-6"}
        >
          {triggerText || (product ? "Edit" : "Tambah Produk")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-background">
        <div className="bg-gradient-to-b from-primary/10 to-transparent px-8 py-8 relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <DialogHeader>
            <DialogTitle className="text-3xl font-extrabold tracking-tight text-foreground">
              {product ? "Edit Data Barang" : "Barang Baru"}
            </DialogTitle>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              {product ? "Perbarui informasi atau harga barang ini." : "Masukkan informasi produk baru ke dalam sistem."}
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
            <Label htmlFor="name" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-2">Nama Barang</Label>
            <Input 
              id="name" 
              name="name" 
              defaultValue={product?.name} 
              required 
              placeholder="Cth: Indomie Goreng Spesial"
              className="h-14 rounded-2xl bg-muted/40 border-none px-6 text-base font-bold shadow-none focus-visible:ring-primary/50 focus-visible:bg-primary/[0.02] transition-colors" 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="barcode" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-2">Barcode</Label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  name="barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="899..."
                  className="h-14 rounded-2xl bg-muted/40 border-none px-6 text-base font-bold shadow-none focus-visible:ring-primary/50 flex-1 transition-colors"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCameraOpen(true)}
                  className="h-14 px-5 rounded-2xl font-bold uppercase tracking-wider text-xs bg-muted hover:bg-muted/80 text-foreground"
                >
                  Scan
                </Button>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-2">Kategori</Label>
              <Input 
                id="category" 
                name="category" 
                defaultValue={product?.category ?? ""} 
                placeholder="Cth: Makanan Ringan"
                className="h-14 rounded-2xl bg-muted/40 border-none px-6 text-base font-bold shadow-none focus-visible:ring-primary/50 transition-colors" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="costPrice" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-2">Harga Modal (Rp)</Label>
              <Input
                id="costPrice"
                name="costPrice"
                type="number"
                min={0}
                step="1"
                defaultValue={product?.costPrice ?? 0}
                required
                className="h-14 rounded-2xl bg-muted/40 border-none px-6 text-lg font-black shadow-none focus-visible:ring-primary/50 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sellPrice" className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">Harga Jual (Rp)</Label>
              <Input
                id="sellPrice"
                name="sellPrice"
                type="number"
                min={0}
                step="1"
                defaultValue={product?.sellPrice ?? 0}
                required
                className="h-14 rounded-2xl bg-primary/10 text-primary border-none px-6 text-lg font-black shadow-none focus-visible:ring-primary/50 focus-visible:bg-primary/20 transition-colors"
              />
            </div>
          </div>
          
          <div className="rounded-2xl border border-foreground/5 bg-background p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <input
                id="trackStock"
                name="trackStock"
                type="checkbox"
                checked={trackStock}
                onChange={(e) => setTrackStock(e.target.checked)}
                className="h-5 w-5 rounded border-muted-foreground/30 text-primary focus:ring-primary cursor-pointer accent-primary"
              />
              <Label htmlFor="trackStock" className="text-[15px] font-bold text-foreground cursor-pointer">Aktifkan Pelacakan Stok</Label>
            </div>
            
            {trackStock && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-foreground/5">
                <div className="space-y-1.5">
                  <Label htmlFor="stockQty" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Stok Awal</Label>
                  <Input
                    id="stockQty"
                    name="stockQty"
                    type="number"
                    min={0}
                    step="1"
                    defaultValue={product?.stockQty ?? 0}
                    className="h-12 rounded-xl bg-muted/40 border-none px-5 text-base font-black shadow-none focus-visible:ring-primary/50 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lowStockThreshold" className="text-[10px] font-black uppercase tracking-widest text-destructive ml-2">Batas Kritis</Label>
                  <Input
                    id="lowStockThreshold"
                    name="lowStockThreshold"
                    type="number"
                    min={0}
                    step="1"
                    defaultValue={product?.lowStockThreshold ?? ""}
                    placeholder="Cth: 5"
                    className="h-12 rounded-xl bg-destructive/5 text-destructive border-none px-5 text-base font-black shadow-none focus-visible:ring-destructive/50 transition-colors placeholder:text-destructive/30"
                  />
                </div>
              </div>
            )}
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
            {isPending ? "Menyimpan..." : "Simpan Barang"}
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
