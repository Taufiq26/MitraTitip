"use client";

import { useState } from "react";
import type { Settlement } from "@/lib/types/settlement";
import { SettlementReceiptDialog } from "./settlement-receipt-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableSearch } from "@/components/ui/data-table-search";
import { Suspense } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServerPagination } from "@/components/ui/server-pagination";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function SettlementHistory({ 
  settlements,
  currentPage,
  totalPages,
  currentLimit
}: { 
  settlements: Settlement[];
  currentPage: number;
  totalPages: number;
  currentLimit: number;
}) {
  const [selected, setSelected] = useState<Settlement | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-12 space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Riwayat Settlement</h2>
        <Suspense fallback={<div className="w-full md:w-64 h-12 bg-muted rounded-2xl animate-pulse" />}>
          <DataTableSearch placeholder="Cari penitip..." />
        </Suspense>
      </div>
      
      <div className="relative z-10 overflow-hidden rounded-3xl bg-background/95 backdrop-blur-xl shadow-sm ring-1 ring-foreground/5">
        <div className="overflow-x-auto p-2">
          <Table>
            <TableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="h-12 px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Penitip</TableHead>
                <TableHead className="h-12 px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Periode</TableHead>
                <TableHead className="h-12 px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Dibayarkan</TableHead>
                <TableHead className="h-12 px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</TableHead>
                <TableHead className="h-12 px-6 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settlements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center">
                    <p className="text-lg font-bold text-muted-foreground">Belum ada settlement yang direalisasi.</p>
                  </TableCell>
                </TableRow>
              )}
              {settlements.map((settlement) => (
                <TableRow key={settlement.id} className="border-b-foreground/5 hover:bg-primary/[0.03] transition-colors">
                  <TableCell className="px-6 py-4 font-bold text-[15px]">{settlement.consignorName}</TableCell>
                  <TableCell className="px-6 py-4 font-medium text-muted-foreground/80">
                    {settlement.periodStart} <span className="mx-1 text-muted-foreground/40">&ndash;</span> {settlement.periodEnd}
                  </TableCell>
                  <TableCell className="px-6 py-4 font-black text-foreground">
                    {currencyFormatter.format(settlement.totalPayout)}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge className="font-bold tracking-wider uppercase text-[10px] px-2.5 py-1 bg-emerald-500 text-white hover:bg-emerald-600 border-none shadow-sm">
                      Realisasi
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-bold text-[10px] uppercase tracking-wider text-foreground border-border shadow-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all px-4 rounded-lg"
                      onClick={() => {
                        setSelected(settlement);
                        setOpen(true);
                      }}
                    >
                      Lihat Struk
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ServerPagination currentPage={currentPage} totalPages={totalPages} currentLimit={currentLimit} />
        </div>
      </div>
      <SettlementReceiptDialog settlement={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
