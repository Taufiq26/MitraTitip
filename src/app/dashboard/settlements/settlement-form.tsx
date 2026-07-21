"use client";

import { useActionState, useState } from "react";
import {
  previewSettlement,
  finalizeSettlement,
  type SettlementPreviewState,
} from "./actions";
import type { Consignor } from "@/lib/types/consignor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const initialState: SettlementPreviewState = { error: null };

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function SettlementForm({
  consignors,
  defaultConsignorId,
}: {
  consignors: Consignor[];
  defaultConsignorId?: string;
}) {
  const [consignorId, setConsignorId] = useState(defaultConsignorId ?? "");
  const [periodStart, setPeriodStart] = useState(todayIso());
  const [periodEnd, setPeriodEnd] = useState(todayIso());
  const [state, formAction, isPending] = useActionState(
    previewSettlement,
    initialState,
  );
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [finalized, setFinalized] = useState(false);

  return (
    <div className="w-full space-y-4">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="consignorId">Penitip</Label>
          <input type="hidden" name="consignorId" value={consignorId} />
          <Select
            value={consignorId}
            onValueChange={(value) => setConsignorId(value ?? "")}
          >
            <SelectTrigger id="consignorId" className="w-full">
              <SelectValue placeholder="Pilih penitip">
                {consignors.find((c) => c.id === consignorId)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {consignors.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="periodStart">Dari tanggal</Label>
            <Input
              id="periodStart"
              name="periodStart"
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="periodEnd">Sampai tanggal</Label>
            <Input
              id="periodEnd"
              name="periodEnd"
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              required
            />
          </div>
        </div>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" disabled={isPending || !consignorId}>
          {isPending ? "Menghitung..." : "Lihat Preview"}
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {/* Tampilkan data yang sudah direalisasi sebelumnya (jika ada) */}
        {state.existingSettlements?.map((settled) => (
          <Card key={settled.id} className="bg-muted/30">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle>Riwayat Settlement</CardTitle>
                <CardDescription>
                  Periode {settled.periodStart} &ndash; {settled.periodEnd}
                </CardDescription>
              </div>
              <Badge 
                variant="outline" 
                className="whitespace-nowrap bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50"
              >
                Sudah direalisasi
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm opacity-80">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total penjualan</span>
                <span>{currencyFormatter.format(settled.totalSales)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee toko</span>
                <span>{currencyFormatter.format(settled.totalFee)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Telah dibayarkan</span>
                <span>{currencyFormatter.format(settled.totalPayout)}</span>
              </div>
              <p className="text-xs text-muted-foreground text-right mt-2">
                Direalisasi pada: {new Date(settled.createdAt).toLocaleString("id-ID")}
              </p>
            </CardContent>
          </Card>
        ))}

        {/* Tampilkan preview untuk data yang belum direalisasi */}
        {state.unsettledPreview ? (
          <Card className="border-primary/50 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle>Preview Settlement Baru</CardTitle>
                <CardDescription>
                  Periode {periodStart} &ndash; {periodEnd}
                </CardDescription>
              </div>
              <Badge variant="outline" className="whitespace-nowrap bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50">
                Belum direalisasi
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sisa penjualan baru</span>
                <span>{currencyFormatter.format(state.unsettledPreview.totalSales)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee toko</span>
                <span>{currencyFormatter.format(state.unsettledPreview.totalFee)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Sisa dibayarkan ke penitip</span>
                <span>{currencyFormatter.format(state.unsettledPreview.totalPayout)}</span>
              </div>
              {finalizeError && (
                <p className="text-sm text-destructive">{finalizeError}</p>
              )}
              <Button
                className="w-full mt-4"
                disabled={finalized}
                onClick={async () => {
                  const result = await finalizeSettlement(
                    consignorId,
                    periodStart,
                    periodEnd,
                    state.unsettledPreview!
                  );
                  if (result.error) {
                    setFinalizeError(result.error);
                  } else {
                    setFinalized(true);
                  }
                }}
              >
                {finalized ? "Berhasil Direalisasi" : "Realisasikan Sisa"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          state.existingSettlements && state.existingSettlements.length > 0 && (
            <p className="text-sm text-center text-muted-foreground py-4 col-span-full">
              Tidak ada transaksi baru yang belum diselesaikan pada periode ini.
            </p>
          )
        )}
      </div>
    </div>
  );
}
