"use client";

import { useState } from "react";
import type { Settlement } from "@/lib/types/settlement";
import { SettlementReceiptDialog } from "./settlement-receipt-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function SettlementHistory({ settlements }: { settlements: Settlement[] }) {
  const [selected, setSelected] = useState<Settlement | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8">
      <h2 className="mb-3 text-lg font-semibold">Riwayat Settlement</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Penitip</TableHead>
            <TableHead>Periode</TableHead>
            <TableHead>Dibayarkan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {settlements.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Belum ada settlement yang direalisasi.
              </TableCell>
            </TableRow>
          )}
          {settlements.map((settlement) => (
            <TableRow key={settlement.id}>
              <TableCell className="font-medium">{settlement.consignorName}</TableCell>
              <TableCell>
                {settlement.periodStart} &ndash; {settlement.periodEnd}
              </TableCell>
              <TableCell>{currencyFormatter.format(settlement.totalPayout)}</TableCell>
              <TableCell>
                <Badge>Sudah Direalisasi</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
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
      <SettlementReceiptDialog settlement={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
