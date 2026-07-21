"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  return (
    <div className="w-full space-y-8">
      <form action={formAction} ref={formRef} className="bg-background/95 backdrop-blur-xl shadow-sm ring-1 ring-foreground/5 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-foreground/5 pb-4 mb-2">
          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Kalkulator Settlement</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="consignorId" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Pilih Penitip</Label>
            <input type="hidden" name="consignorId" value={consignorId} />
            <Select
              value={consignorId}
              onValueChange={(value) => setConsignorId(value ?? "")}
            >
              <SelectTrigger id="consignorId" className="w-full h-14 rounded-2xl bg-muted/40 border-none px-5 text-base font-bold shadow-none focus-visible:ring-primary/50 transition-colors">
                <SelectValue placeholder="Pilih mitra...">
                  {consignors.find((c) => c.id === consignorId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-background/95 backdrop-blur-xl ring-1 ring-foreground/5">
                {consignors.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="font-bold text-base cursor-pointer rounded-xl py-3 px-4 mb-1 last:mb-0 focus:bg-primary/10 focus:text-primary transition-colors">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="periodStart" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mulai Tanggal</Label>
            <Input
              id="periodStart"
              name="periodStart"
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              required
              className="h-14 rounded-2xl bg-muted/40 border-none px-5 text-sm font-bold shadow-none focus-visible:ring-primary/50 transition-colors cursor-pointer"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="periodEnd" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Sampai Tanggal</Label>
            <Input
              id="periodEnd"
              name="periodEnd"
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              required
              className="h-14 rounded-2xl bg-muted/40 border-none px-5 text-sm font-bold shadow-none focus-visible:ring-primary/50 transition-colors cursor-pointer"
            />
          </div>
        </div>

        {state.error && (
          <div className="rounded-xl bg-destructive/10 p-4 ring-1 ring-destructive/20 mt-4">
            <p className="text-sm font-bold text-destructive">{state.error}</p>
          </div>
        )}

        <div className="pt-2">
          <Button 
            type="submit" 
            disabled={isPending || !consignorId}
            className="h-14 px-8 rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/10 transition-all hover:shadow-primary/20 active:scale-[0.98] w-full md:w-auto"
          >
            {isPending ? "Menghitung Kalkulasi..." : "Kalkulasi Penjualan"}
          </Button>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        {/* Tampilkan data yang sudah direalisasi sebelumnya (jika ada) */}
        {state.existingSettlements?.map((settled) => (
          <Card key={settled.id} className="rounded-3xl border-none bg-muted/40 shadow-none ring-1 ring-foreground/5 overflow-hidden">
            <div className="bg-foreground/[0.02] border-b border-foreground/5 p-6">
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="text-xl font-bold">Riwayat Settlement</CardTitle>
                <Badge className="font-bold tracking-wider uppercase text-[10px] px-2.5 py-1 bg-emerald-500 text-white hover:bg-emerald-600 border-none shadow-sm">
                  Sudah Direalisasi
                </Badge>
              </div>
              <CardDescription className="font-medium text-muted-foreground">
                Periode {settled.periodStart} &ndash; {settled.periodEnd}
              </CardDescription>
            </div>
            
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-muted-foreground">Total Penjualan</span>
                  <span className="font-bold text-foreground">{currencyFormatter.format(settled.totalSales)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-muted-foreground">Fee Toko</span>
                  <span className="font-bold text-destructive">{currencyFormatter.format(settled.totalFee)}</span>
                </div>
                <div className="pt-3 border-t border-foreground/10 flex justify-between items-center">
                  <span className="font-bold text-foreground text-sm uppercase tracking-wider">Telah Dibayarkan</span>
                  <span className="font-black text-emerald-600 text-lg">{currencyFormatter.format(settled.totalPayout)}</span>
                </div>
              </div>

              <p className="text-[11px] font-medium text-muted-foreground/80 pt-2 border-t border-foreground/5">
                Direalisasi pada: <span className="font-bold text-foreground/80">{new Date(settled.createdAt).toLocaleString("id-ID")}</span>
              </p>

              {settled.details && settled.details.length > 0 && (
                <div className="mt-6">
                  <details className="group [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer items-center justify-between font-bold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
                      <span className="flex items-center gap-2">
                        <span className="transition-transform group-open:rotate-90">▶</span>
                        Lihat Rincian Barang
                      </span>
                    </summary>
                    <ul className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {settled.details.map(d => (
                        <li key={d.productId} className="flex justify-between items-center text-xs p-2 rounded-lg bg-background/50 ring-1 ring-foreground/5">
                          <span className="truncate pr-2 font-medium">
                            <span className="font-bold mr-1 text-foreground">{d.qty}x</span> {d.productName}
                          </span>
                          <span className="font-bold text-muted-foreground">{currencyFormatter.format(d.totalSales)}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Tampilkan preview untuk data yang belum direalisasi */}
        {state.unsettledPreview ? (
          <Card className="rounded-3xl border-none bg-background shadow-xl ring-1 ring-primary/20 overflow-hidden lg:col-span-2 xl:col-span-2">
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-primary/10 p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
                <div>
                  <CardTitle className="text-2xl font-extrabold tracking-tight">Kalkulasi Tagihan Baru</CardTitle>
                  <CardDescription className="font-medium text-muted-foreground mt-1">
                    Periode {periodStart} <span className="mx-1 text-muted-foreground/40">&ndash;</span> {periodEnd}
                  </CardDescription>
                </div>
                <Badge className="w-fit font-bold tracking-wider uppercase text-[10px] px-3 py-1.5 bg-amber-500 text-white hover:bg-amber-600 border-none shadow-md">
                  Belum Direalisasi
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-base font-medium">
                  <span className="text-muted-foreground">Penjualan Bersih</span>
                  <span className="font-bold text-foreground">{currencyFormatter.format(state.unsettledPreview.totalSales)}</span>
                </div>
                <div className="flex justify-between items-center text-base font-medium">
                  <span className="text-muted-foreground">Potongan Fee Toko</span>
                  <span className="font-bold text-destructive">{currencyFormatter.format(state.unsettledPreview.totalFee)}</span>
                </div>
                
                <div className="p-4 rounded-2xl bg-primary/5 ring-1 ring-primary/20 mt-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest text-primary mb-1">Total Yang Harus Dibayar</span>
                    <span className="font-black text-3xl text-foreground">{currencyFormatter.format(state.unsettledPreview.totalPayout)}</span>
                  </div>
                </div>

                {finalizeError && (
                  <div className="rounded-xl bg-destructive/10 p-3 ring-1 ring-destructive/20 mt-4">
                    <p className="text-sm font-bold text-destructive">{finalizeError}</p>
                  </div>
                )}
                
                <Button
                  className="w-full h-14 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98] mt-6"
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
                      formRef.current?.requestSubmit();
                      router.refresh();
                    }
                  }}
                >
                  {finalized ? "Berhasil Direalisasi!" : "Realisasikan Pembayaran"}
                </Button>
              </div>

              {state.unsettledPreview.details && state.unsettledPreview.details.length > 0 && (
                <div className="bg-muted/30 rounded-2xl p-5 ring-1 ring-foreground/5 h-full max-h-[400px] flex flex-col">
                  <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-4">Rincian Barang Terjual</p>
                  <ul className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    {state.unsettledPreview.details.map(d => (
                      <li key={d.productId} className="flex justify-between items-center p-3 rounded-xl bg-background shadow-sm ring-1 ring-foreground/5">
                        <span className="truncate pr-2 font-medium text-sm">
                          <span className="font-extrabold mr-1.5 text-primary">{d.qty}x</span> {d.productName}
                        </span>
                        <span className="font-bold text-foreground text-sm">{currencyFormatter.format(d.totalSales)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          state.existingSettlements && state.existingSettlements.length > 0 && (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center col-span-full">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
                <svg className="h-8 w-8 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-2">Semua Sudah Diselesaikan</h3>
              <p className="text-sm font-medium text-muted-foreground max-w-sm mx-auto">
                Tidak ada transaksi baru yang belum diselesaikan pada periode yang Anda pilih.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
