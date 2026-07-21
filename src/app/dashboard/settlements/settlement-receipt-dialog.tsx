"use client";

import { useEffect, useState } from "react";
import { getReceiptDetails, type SettlementItemDetail } from "./actions";

import type { Settlement } from "@/lib/types/settlement";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function SettlementReceiptDialog({
  settlement,
  open,
  onOpenChange,
}: {
  settlement: Settlement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [details, setDetails] = useState<SettlementItemDetail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && settlement) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      getReceiptDetails(settlement.consignorId, settlement.periodStart, settlement.periodEnd, settlement.createdAt)
        .then(setDetails)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setDetails([]);
    }
  }, [open, settlement]);

  if (!settlement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Struk Settlement</DialogTitle>
        </DialogHeader>
        <div id="receipt-print-area" className="space-y-3 font-mono text-sm">
          <div className="text-center">
            <p className="font-semibold">MitraTitip</p>
            <p className="text-xs text-muted-foreground">
              Rekap Settlement Titipan
            </p>
          </div>
          <div className="border-t border-dashed pt-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Penitip</span>
              <span>{settlement.consignorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Periode</span>
              <span>
                {settlement.periodStart} &ndash; {settlement.periodEnd}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Direalisasi</span>
              <span>
                {new Date(settlement.createdAt).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
          <div className="border-t border-dashed pt-2">
            <p className="font-semibold mb-2 text-xs">Rincian Barang Terjual:</p>
            {loading ? (
              <p className="text-muted-foreground text-center py-2 animate-pulse text-xs">Memuat rincian...</p>
            ) : details.length > 0 ? (
              <ul className="space-y-1">
                {details.map((d) => (
                  <li key={d.productId} className="flex justify-between text-xs">
                    <span className="truncate pr-2">{d.qty}x {d.productName}</span>
                    <span>{currencyFormatter.format(d.totalSales)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-2 text-xs">Tidak ada rincian barang.</p>
            )}
          </div>
          <div className="border-t border-dashed pt-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total penjualan</span>
              <span>{currencyFormatter.format(settlement.totalSales)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee toko</span>
              <span>{currencyFormatter.format(settlement.totalFee)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Dibayarkan ke penitip</span>
              <span>{currencyFormatter.format(settlement.totalPayout)}</span>
            </div>
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
