"use client";

import React, { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const PAYMENT_LABEL: Record<string, string> = {
  cash: "Tunai",
  qris: "QRIS",
  transfer: "Transfer Bank",
};

export type TransactionHistoryItem = {
  id: string;
  localId: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  cashierName?: string;
  items: {
    productId: string;
    productName: string;
    qty: number;
    subtotal: number;
  }[];
};

export function TransactionHistory({ transactions }: { transactions: TransactionHistoryItem[] }) {
  const [search, setSearch] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return newExpanded;
    });
  };

  const debouncedSearch = useDebounce(search, 300);

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((t) => {
      if (!debouncedSearch) return true;
      const lowerSearch = debouncedSearch.toLowerCase();
      return (
        t.localId.toLowerCase().includes(lowerSearch) ||
        (t.cashierName && t.cashierName.toLowerCase().includes(lowerSearch))
      );
    });
  }, [transactions, debouncedSearch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Riwayat Transaksi</h2>
          <p className="text-muted-foreground mt-1 text-base">Daftar transaksi pada periode ini.</p>
        </div>
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari ID Transaksi atau kasir..."
            className="pl-10 h-11 rounded-lg bg-background shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-background overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12"></TableHead>
              <TableHead className="font-semibold text-foreground">Waktu</TableHead>
              <TableHead className="font-semibold text-foreground">Kasir</TableHead>
              <TableHead className="font-semibold text-foreground">Metode</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                  Tidak ada transaksi ditemukan.
                </TableCell>
              </TableRow>
            )}
            {filteredTransactions.map((t) => (
              <React.Fragment key={t.id}>
                <TableRow
                  className={`cursor-pointer transition-colors ${expandedRows.has(t.id) ? 'bg-muted/10' : 'hover:bg-muted/30'}`}
                  onClick={() => toggleRow(t.id)}
                >
                  <TableCell className="pl-4 w-12">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors">
                      {expandedRows.has(t.id) ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="font-semibold text-foreground">
                      {new Date(t.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </div>
                    <div className="text-xs font-medium text-muted-foreground mt-0.5">
                      {new Date(t.createdAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{t.cashierName || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-semibold px-3 py-1 rounded-md text-xs tracking-wide">
                      {PAYMENT_LABEL[t.paymentMethod] || t.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg tracking-tight text-foreground">
                    {currencyFormatter.format(t.totalAmount)}
                  </TableCell>
                </TableRow>

                {/* Expandable Row Content */}
                {expandedRows.has(t.id) && (
                  <TableRow className="bg-muted/10 hover:bg-muted/10 border-t-0">
                    <TableCell colSpan={5} className="p-0 border-b-0">
                      <div className="pl-[4.5rem] pr-6 py-6 space-y-4">
                        <h4 className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                          Detail Barang
                        </h4>

                        {t.items.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Tidak ada item.</p>
                        ) : (
                          <div className="max-w-2xl bg-background rounded-xl border p-5 shadow-sm space-y-3">
                            {t.items.map((item, index) => (
                              <div key={index} className="flex justify-between items-start text-sm">
                                <div className="flex gap-4">
                                  <span className="font-bold text-muted-foreground w-6 text-right">{item.qty}x</span>
                                  <span className="font-semibold text-foreground">{item.productName || "-"}</span>
                                </div>
                                <div className="font-semibold tabular-nums text-foreground">
                                  {currencyFormatter.format(item.subtotal)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
