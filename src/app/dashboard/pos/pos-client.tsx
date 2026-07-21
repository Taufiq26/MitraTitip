"use client";

import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Trash2 } from "lucide-react";
import type { Product } from "@/lib/types/product";
import { db } from "@/lib/offline/db";
import {
  queueTransaction,
  flushPendingTransactions,
  countPendingTransactions,
} from "@/lib/offline/sync-queue";
import { BarcodeCameraDialog } from "./barcode-camera-dialog";
import { ReceiptDialog, type ReceiptData } from "./receipt-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CartItem {
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
}

type PaymentMethod = "cash" | "qris" | "transfer";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function PosClient({
  initialProducts,
  cashierName,
}: {
  initialProducts: Product[];
  cashierName: string;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    db.cachedProducts.bulkPut(
      initialProducts.map((p) => ({
        id: p.id,
        name: p.name,
        barcode: p.barcode,
        sellPrice: p.sellPrice,
        trackStock: p.trackStock,
        stockQty: p.stockQty,
        isConsignment: p.isConsignment,
      })),
    );
  }, [initialProducts]);

  useEffect(() => {
    function refreshPendingCount() {
      countPendingTransactions().then(setPendingCount);
    }
    refreshPendingCount();

    async function handleOnline() {
      await flushPendingTransactions();
      refreshPendingCount();
    }

    window.addEventListener("online", handleOnline);
    const interval = setInterval(refreshPendingCount, 15000);
    return () => {
      window.removeEventListener("online", handleOnline);
      clearInterval(interval);
    };
  }, []);

  const debouncedSearch = useDebounce(search, 300);

  const filteredProducts = useMemo(() => {
    if (!debouncedSearch.trim()) return products.slice(0, 20);
    const query = debouncedSearch.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) || p.barcode?.includes(query),
    );
  }, [products, debouncedSearch]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty * item.unitPrice, 0),
    [cart],
  );

  const cashReceivedNumber = Number(cashReceived) || 0;
  const changeAmount =
    paymentMethod === "cash" ? Math.max(0, cashReceivedNumber - total) : null;

  function addToCart(product: Product) {
    if (product.trackStock && product.stockQty <= 0) {
      setSubmitError(`Stok ${product.name} habis.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (product.trackStock && existing.qty + 1 > product.stockQty) {
          setSubmitError(`Stok ${product.name} hanya tersisa ${product.stockQty}.`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unitPrice: product.sellPrice,
          qty: 1,
        },
      ];
    });
    setSearch("");
  }

  function addByBarcode(barcode: string) {
    const product = products.find((p) => p.barcode === barcode);
    if (product) {
      addToCart(product);
      setSubmitError(null);
    } else {
      setSubmitError(`Barang dengan barcode "${barcode}" tidak ditemukan`);
    }
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }
    const product = products.find(p => p.id === productId);
    if (product?.trackStock && qty > product.stockQty) {
      setSubmitError(`Stok ${product.name} hanya tersisa ${product.stockQty}.`);
      qty = product.stockQty;
    }
    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, qty } : item)),
    );
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && search.trim()) {
      event.preventDefault();
      const exactMatch = products.find((p) => p.barcode === search.trim());
      if (exactMatch) {
        addToCart(exactMatch);
      } else if (filteredProducts.length === 1) {
        addToCart(filteredProducts[0]);
      }
    }
  }

  async function handleSubmit() {
    if (cart.length === 0) return;

    for (const item of cart) {
      const product = products.find((p) => p.id === item.productId);
      if (product?.trackStock && item.qty > product.stockQty) {
        setSubmitError(`Tidak dapat menyelesaikan transaksi: Stok ${product.name} hanya tersisa ${product.stockQty}.`);
        return;
      }
    }

    if (paymentMethod === "cash" && cashReceivedNumber < total) {
      setSubmitError("Uang tunai yang diterima kurang dari total belanja");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const localId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    const createdAt = new Date().toISOString();

    await queueTransaction({
      localId,
      totalAmount: total,
      paymentMethod,
      cashReceived: paymentMethod === "cash" ? cashReceivedNumber : null,
      changeAmount: paymentMethod === "cash" ? changeAmount : null,
      items: cart.map((item) => ({
        productId: item.productId,
        qty: item.qty,
        unitPrice: item.unitPrice,
      })),
      createdAt,
    });

    const updatedProducts = products.map((p) => {
      const cartItem = cart.find((item) => item.productId === p.id);
      if (cartItem && p.trackStock) {
        return { ...p, stockQty: p.stockQty - cartItem.qty };
      }
      return p;
    });
    setProducts(updatedProducts);

    db.cachedProducts.bulkPut(
      updatedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        barcode: p.barcode,
        sellPrice: p.sellPrice,
        trackStock: p.trackStock,
        stockQty: p.stockQty,
        isConsignment: p.isConsignment,
      }))
    );

    await flushPendingTransactions();
    countPendingTransactions().then(setPendingCount);

    setReceipt({
      items: cart.map((item) => ({
        name: item.name,
        qty: item.qty,
        unitPrice: item.unitPrice,
        subtotal: item.qty * item.unitPrice,
      })),
      totalAmount: total,
      paymentMethod,
      cashReceived: paymentMethod === "cash" ? cashReceivedNumber : null,
      changeAmount,
      cashierName,
      createdAt,
    });
    setReceiptOpen(true);
    setCart([]);
    setCashReceived("");
    setIsSubmitting(false);
  }

  return (
    <div className="relative grid h-[calc(100vh-12rem)] min-h-[600px] grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Area: Products & Search */}
      <div className="relative z-10 flex min-h-0 flex-col lg:col-span-7 xl:col-span-8">
        <div className="flex-none flex items-center justify-between pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Kasir</h1>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {pendingCount} Menunggu Sinkron
            </Badge>
          )}
        </div>

        <div className="flex-none flex gap-3 pb-6">
          <Input
            placeholder="Cari nama barang atau scan barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            autoFocus
            className="h-14 rounded-2xl border-none bg-background/50 px-6 text-lg shadow-sm backdrop-blur-sm focus-visible:ring-primary/50"
          />
          <Button
            variant="outline"
            onClick={() => setCameraOpen(true)}
            className="h-14 rounded-2xl border-none bg-background/50 px-6 text-sm font-bold uppercase tracking-wider shadow-sm hover:bg-background"
          >
            Scan Kamera
          </Button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto -mx-2 px-2 pb-12 pt-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => addToCart(product)}
                className="group flex h-full min-h-[8.5rem] flex-col justify-between rounded-3xl bg-background p-5 text-left shadow-sm ring-1 ring-foreground/5 transition-all duration-200 hover:-translate-y-1 hover:bg-primary/[0.02] hover:shadow-md hover:ring-primary/30 active:translate-y-0 active:scale-95"
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <p className="pr-1 text-[15px] font-bold leading-snug tracking-tight text-foreground/90 group-hover:text-foreground">{product.name}</p>
                  <div className="flex shrink-0 flex-col items-end gap-1.5 mt-0.5">
                    {product.isConsignment && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">Titipan</span>
                    )}
                    {product.trackStock && (
                      <span className="rounded-full border border-foreground/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sisa: {product.stockQty}</span>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xl font-black tracking-tighter text-foreground">
                  {currencyFormatter.format(product.sellPrice)}
                </p>
              </button>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full flex h-32 items-center justify-center rounded-3xl border-2 border-dashed border-muted">
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Barang tidak ditemukan
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Area: Cart Bento Box */}
      <div className="min-h-0 lg:col-span-5 xl:col-span-4 relative z-10">
        <div className="flex h-full flex-col rounded-3xl bg-gradient-to-b from-background to-primary/[0.05] p-6 shadow-sm ring-1 ring-foreground/5">
          <div className="mb-6 flex-none">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Rincian Belanja</h2>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {cart.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
                <p className="text-lg font-bold tracking-tight text-muted-foreground">Keranjang kosong</p>
                <p className="mt-1 text-sm font-medium">Silakan pilih atau scan barang.</p>
              </div>
            )}
            {cart.map((item) => (
              <div key={item.productId} className="flex items-center justify-between gap-3 rounded-2xl bg-muted/30 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{item.name}</p>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                    {currencyFormatter.format(item.unitPrice)} &times; {item.qty}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    value={item.qty}
                    onChange={(e) =>
                      updateQty(item.productId, Number(e.target.value))
                    }
                    className="h-10 w-16 rounded-xl border-none bg-background text-center font-bold shadow-sm focus-visible:ring-primary/50"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10"
                    onClick={() => updateQty(item.productId, 0)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <div className="mt-6 space-y-6 border-t border-dashed border-foreground/10 pt-6">
              <div className="flex items-end justify-between">
                <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Total Tagihan</span>
                <span className="text-4xl font-black tracking-tighter text-foreground">{currencyFormatter.format(total)}</span>
              </div>

              <div className="space-y-3">
                <Label htmlFor="paymentMethod" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Metode Pembayaran</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value) =>
                    setPaymentMethod((value as PaymentMethod) ?? "cash")
                  }
                >
                  <SelectTrigger id="paymentMethod" className="h-12 w-full rounded-xl border-none bg-muted/30 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="cash" className="font-bold">Tunai (Cash)</SelectItem>
                    <SelectItem value="qris" className="font-bold">QRIS</SelectItem>
                    <SelectItem value="transfer" className="font-bold">Transfer Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === "cash" && (
                <div className="space-y-3">
                  <Label htmlFor="cashReceived" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Uang Diterima</Label>
                  <Input
                    id="cashReceived"
                    type="number"
                    min={0}
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="h-14 rounded-xl border-none bg-muted/30 text-lg font-black placeholder:font-medium placeholder:text-muted-foreground/50 focus-visible:ring-primary/50"
                    placeholder="Contoh: 50000"
                  />
                  {changeAmount !== null && (
                    <div className="flex items-center justify-between rounded-xl bg-primary/10 p-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-primary">Kembalian</span>
                      <span className="text-lg font-black text-primary">{currencyFormatter.format(changeAmount)}</span>
                    </div>
                  )}
                </div>
              )}

              {submitError && (
                <div className="rounded-xl bg-destructive/10 p-3">
                  <p className="text-center text-xs font-bold text-destructive">{submitError}</p>
                </div>
              )}

              <Button
                className="h-16 w-full rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98]"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? "Memproses..." : "Selesaikan"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <BarcodeCameraDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onScan={addByBarcode}
      />
      <ReceiptDialog
        receipt={receipt}
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
      />
    </div>
  );
}
