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
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Kasir</h1>
          {pendingCount > 0 && (
            <Badge variant="secondary">
              {pendingCount} transaksi menunggu sinkron
            </Badge>
          )}
        </div>
        <div className="mb-4 flex gap-2">
          <Input
            placeholder="Cari nama barang atau scan barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            autoFocus
          />
          <Button variant="outline" onClick={() => setCameraOpen(true)}>
            Scan Kamera
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => addToCart(product)}
              className="group flex flex-col rounded-lg bg-card p-3 text-left text-sm shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] ring-1 ring-foreground/5 transition-all duration-150 hover:ring-primary/50 hover:shadow-md"
            >
              <div className="flex w-full items-start justify-between gap-1">
                <p className="font-medium pr-2">{product.name}</p>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {product.isConsignment && (
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px] leading-tight h-4 rounded-sm">Titipan</Badge>
                  )}
                  {product.trackStock && (
                    <Badge variant="outline" className="px-1.5 py-0 text-[10px] leading-tight h-4 rounded-sm font-medium">Sisa: {product.stockQty}</Badge>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground mt-1">
                {currencyFormatter.format(product.sellPrice)}
              </p>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">
              Barang tidak ditemukan.
            </p>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Keranjang</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Belum ada barang di keranjang.
              </p>
            )}
            {cart.map((item) => (
              <div key={item.productId} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted-foreground">
                    {currencyFormatter.format(item.unitPrice)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    value={item.qty}
                    onChange={(e) =>
                      updateQty(item.productId, Number(e.target.value))
                    }
                    className="w-16 h-9"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive hover:bg-destructive/10"
                    onClick={() => updateQty(item.productId, 0)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {cart.length > 0 && (
              <>
                <div className="flex justify-between border-t pt-3 text-base font-semibold">
                  <span>Total</span>
                  <span>{currencyFormatter.format(total)}</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Metode pembayaran</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(value) =>
                      setPaymentMethod((value as PaymentMethod) ?? "cash")
                    }
                  >
                    <SelectTrigger id="paymentMethod" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Tunai</SelectItem>
                      <SelectItem value="qris">QRIS</SelectItem>
                      <SelectItem value="transfer">Transfer Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === "cash" && (
                  <div className="space-y-2">
                    <Label htmlFor="cashReceived">Uang diterima</Label>
                    <Input
                      id="cashReceived"
                      type="number"
                      min={0}
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                    />
                    {changeAmount !== null && (
                      <p className="text-sm text-muted-foreground">
                        Kembalian: {currencyFormatter.format(changeAmount)}
                      </p>
                    )}
                  </div>
                )}

                {submitError && (
                  <p className="text-sm text-destructive">{submitError}</p>
                )}

                <Button
                  className="w-full"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? "Memproses..." : "Selesaikan Transaksi"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
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
