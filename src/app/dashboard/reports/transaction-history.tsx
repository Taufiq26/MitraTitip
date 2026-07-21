"use client";

import React, { useState } from "react";
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
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (!search) return true;
    const lowerSearch = search.toLowerCase();
    return (
      t.localId.toLowerCase().includes(lowerSearch) ||
      (t.cashierName && t.cashierName.toLowerCase().includes(lowerSearch))
    );
  });

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold">Riwayat Transaksi</h2>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari ID Transaksi atau kasir..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead>Kasir</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead className="text-right">Total</TableHead>
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
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleRow(t.id)}
                >
                  <TableCell className="pl-4">
                    {expandedRows.has(t.id) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(t.createdAt).toLocaleString("id-ID", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </TableCell>
                  <TableCell>{t.cashierName || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {PAYMENT_LABEL[t.paymentMethod] || t.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {currencyFormatter.format(t.totalAmount)}
                  </TableCell>
                </TableRow>
                
                {/* Expandable Row Content */}
                {expandedRows.has(t.id) && (
                  <TableRow className="bg-muted/5 hover:bg-muted/5">
                    <TableCell colSpan={5} className="p-0">
                      <div className="p-4 pl-12 bg-muted/20">
                        <p className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
                          Detail Barang
                        </p>
                        <div className="border rounded-md bg-background overflow-hidden max-w-2xl">
                          <Table>
                            <TableHeader className="bg-muted/50">
                              <TableRow className="hover:bg-transparent">
                                <TableHead className="h-8 py-1">Nama Barang</TableHead>
                                <TableHead className="h-8 py-1 text-right w-24">Qty</TableHead>
                                <TableHead className="h-8 py-1 text-right w-32">Subtotal</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {t.items.length === 0 && (
                                <TableRow className="hover:bg-transparent">
                                  <TableCell colSpan={3} className="text-center text-muted-foreground py-2 text-sm">
                                    Tidak ada item.
                                  </TableCell>
                                </TableRow>
                              )}
                              {t.items.map((item, index) => (
                                <TableRow key={index} className="hover:bg-transparent border-0">
                                  <TableCell className="py-2 text-sm">{item.productName || "-"}</TableCell>
                                  <TableCell className="py-2 text-sm text-right">{item.qty}</TableCell>
                                  <TableCell className="py-2 text-sm text-right font-mono">
                                    {currencyFormatter.format(item.subtotal)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
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
