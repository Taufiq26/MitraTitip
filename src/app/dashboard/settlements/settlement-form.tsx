"use client";

import { useActionState, useState } from "react";
import {
  previewSettlement,
  finalizeSettlement,
  type SettlementPreviewState,
} from "./actions";
import type { Consignor } from "@/lib/types/consignor";
import { Button } from "@/components/ui/button";
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

const initialState: SettlementPreviewState = { error: null, preview: null };

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
    <div className="max-w-lg space-y-4">
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

      {state.preview && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Settlement</CardTitle>
            <CardDescription>
              Periode {periodStart} &ndash; {periodEnd}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total penjualan</span>
              <span>{currencyFormatter.format(state.preview.totalSales)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee toko</span>
              <span>{currencyFormatter.format(state.preview.totalFee)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Dibayarkan ke penitip</span>
              <span>{currencyFormatter.format(state.preview.totalPayout)}</span>
            </div>
            {finalizeError && (
              <p className="text-sm text-destructive">{finalizeError}</p>
            )}
            <Button
              className="w-full"
              disabled={finalized}
              onClick={async () => {
                const result = await finalizeSettlement(
                  consignorId,
                  periodStart,
                  periodEnd,
                  state.preview!,
                );
                if (result.error) {
                  setFinalizeError(result.error);
                } else {
                  setFinalized(true);
                }
              }}
            >
              {finalized ? "Tersimpan" : "Finalisasi & Simpan"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
