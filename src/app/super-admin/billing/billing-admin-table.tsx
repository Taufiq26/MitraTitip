"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface TenantBillingRow {
  tenantId: string;
  tenantName: string;
  status: "trial" | "active" | "grace" | "suspended";
  feePercent: number;
  currentInvoice: {
    id: string;
    period: string;
    netRevenue: number;
    amountDue: number;
    status: string;
    dueDate: string;
  } | null;
}

const STATUS_BADGE: Record<TenantBillingRow["status"], string> = {
  trial: "border-blue-300 bg-blue-50 text-blue-700",
  active: "border-emerald-300 bg-emerald-50 text-emerald-700",
  grace: "border-amber-300 bg-amber-50 text-amber-700",
  suspended: "border-red-300 bg-red-50 text-red-700",
};

function formatCurrency(amount: number): string {
  return `Rp${amount.toLocaleString("id-ID")}`;
}

function FeeEditor({ tenantId, initialFeePercent }: { tenantId: string; initialFeePercent: number }) {
  const router = useRouter();
  const [value, setValue] = useState(String(initialFeePercent));
  const [isPending, setIsPending] = useState(false);

  async function handleSave() {
    const feePercent = Number(value);
    if (Number.isNaN(feePercent)) return;

    setIsPending(true);
    await fetch(`/api/admin/tenants/${tenantId}/fee`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fee_percent: feePercent }),
    });
    setIsPending(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        step="0.1"
        min="0"
        max="100"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 w-20"
      />
      <span className="text-sm text-muted-foreground">%</span>
      <Button size="sm" variant="outline" onClick={handleSave} disabled={isPending}>
        {isPending ? "..." : "Simpan"}
      </Button>
    </div>
  );
}

function MarkPaidButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleMarkPaid() {
    setIsPending(true);
    await fetch(`/api/admin/invoices/${invoiceId}/mark-paid`, { method: "PATCH" });
    setIsPending(false);
    router.refresh();
  }

  return (
    <Button size="sm" variant="outline" onClick={handleMarkPaid} disabled={isPending}>
      {isPending ? "..." : "Tandai Lunas"}
    </Button>
  );
}

export function BillingAdminTable({ rows }: { rows: TenantBillingRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Toko</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Fee %</TableHead>
            <TableHead>Tagihan Terkini</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                Belum ada tenant.
              </TableCell>
            </TableRow>
          )}
          {rows.map((row) => (
            <TableRow key={row.tenantId}>
              <TableCell className="font-bold">{row.tenantName}</TableCell>
              <TableCell>
                <Badge variant="outline" className={STATUS_BADGE[row.status]}>
                  {row.status}
                </Badge>
              </TableCell>
              <TableCell>
                <FeeEditor tenantId={row.tenantId} initialFeePercent={row.feePercent} />
              </TableCell>
              <TableCell>
                {row.currentInvoice ? (
                  <div className="text-sm">
                    <p>{row.currentInvoice.period}</p>
                    <p className="text-muted-foreground">
                      {formatCurrency(row.currentInvoice.amountDue)} &middot; {row.currentInvoice.status}
                    </p>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Belum ada tagihan</span>
                )}
              </TableCell>
              <TableCell>
                {row.currentInvoice && ["unpaid", "overdue"].includes(row.currentInvoice.status) && (
                  <MarkPaidButton invoiceId={row.currentInvoice.id} />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
