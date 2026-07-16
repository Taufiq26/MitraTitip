"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ReceiptData {
  items: { name: string; qty: number; unitPrice: number; subtotal: number }[];
  totalAmount: number;
  paymentMethod: "cash" | "qris" | "transfer";
  cashReceived: number | null;
  changeAmount: number | null;
  cashierName: string;
  createdAt: string;
}

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const PAYMENT_LABEL: Record<ReceiptData["paymentMethod"], string> = {
  cash: "Tunai",
  qris: "QRIS",
  transfer: "Transfer Bank",
};

export function ReceiptDialog({
  receipt,
  open,
  onOpenChange,
}: {
  receipt: ReceiptData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!receipt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Struk Transaksi</DialogTitle>
        </DialogHeader>
        <div id="receipt-print-area" className="space-y-3 font-mono text-sm">
          <div className="text-center">
            <p className="font-semibold">MitraTitip</p>
            <p className="text-xs text-muted-foreground">
              {new Date(receipt.createdAt).toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-muted-foreground">
              Kasir: {receipt.cashierName}
            </p>
          </div>
          <div className="border-t border-dashed pt-2">
            {receipt.items.map((item, index) => (
              <div key={index} className="mb-1">
                <div className="flex justify-between">
                  <span>{item.name}</span>
                  <span>{currencyFormatter.format(item.subtotal)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.qty} x {currencyFormatter.format(item.unitPrice)}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed pt-2">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{currencyFormatter.format(receipt.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Bayar ({PAYMENT_LABEL[receipt.paymentMethod]})</span>
              <span>
                {receipt.cashReceived !== null
                  ? currencyFormatter.format(receipt.cashReceived)
                  : "-"}
              </span>
            </div>
            {receipt.changeAmount !== null && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Kembalian</span>
                <span>{currencyFormatter.format(receipt.changeAmount)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
          <Button className="flex-1" onClick={() => window.print()}>
            Cetak Struk
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
