import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import {
  mapConsignmentBatchRow,
  type ConsignmentBatchRow,
} from "@/lib/types/consignment-batch";
import { mapConsignorRow, type ConsignorRow } from "@/lib/types/consignor";
import { BatchDialog } from "./batch-dialog";
import { ReturnBatchButton } from "./return-batch-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableSearch } from "@/components/ui/data-table-search";
import { Suspense } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { ServerPagination } from "@/components/ui/server-pagination";

export default async function ConsignorDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; activePage?: string; inactivePage?: string; activeLimit?: string; inactiveLimit?: string }>;
}) {
  const { id } = await params;
  const { q, activePage, inactivePage, activeLimit, inactiveLimit } = await searchParams;
  const activeCurPage = parseInt(activePage || "1", 10);
  const inactiveCurPage = parseInt(inactivePage || "1", 10);
  const ACTIVE_PAGE_SIZE = parseInt(activeLimit || "10", 10);
  const INACTIVE_PAGE_SIZE = parseInt(inactiveLimit || "10", 10);
  const profile = await getCurrentProfile();
  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { data: consignorRow } = await supabase
    .from("consignors")
    .select("*")
    .eq("id", id)
    .returns<ConsignorRow[]>()
    .single();

  if (!consignorRow) {
    notFound();
  }
  const consignor = mapConsignorRow(consignorRow);

  let batchQuery = supabase
    .from("consignment_batches")
    .select("*, products!inner(name)")
    .eq("consignor_id", id)
    .order("date_received", { ascending: false });

  if (q) {
    batchQuery = batchQuery.ilike("products.name", `%${q}%`);
  }

  const { data: batchRows } = await batchQuery.returns<ConsignmentBatchRow[]>();

  const batches = (batchRows ?? []).map(mapConsignmentBatchRow);

  const allActiveBatches = batches.filter(
    (b) => b.status === "active" && b.qtyReceived - b.qtySold - b.qtyReturned > 0
  );
  const allInactiveBatches = batches.filter(
    (b) => b.status !== "active" || b.qtyReceived - b.qtySold - b.qtyReturned <= 0
  );

  const activeTotalPages = Math.ceil(allActiveBatches.length / ACTIVE_PAGE_SIZE) || 1;
  const inactiveTotalPages = Math.ceil(allInactiveBatches.length / INACTIVE_PAGE_SIZE) || 1;

  const activeBatches = allActiveBatches.slice((activeCurPage - 1) * ACTIVE_PAGE_SIZE, activeCurPage * ACTIVE_PAGE_SIZE);
  const inactiveBatches = allInactiveBatches.slice((inactiveCurPage - 1) * INACTIVE_PAGE_SIZE, inactiveCurPage * INACTIVE_PAGE_SIZE);

  return (
    <div className="relative space-y-8">
      <Link
        href="/dashboard/consignors"
        className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 mb-2"
      >
        <span className="text-lg leading-none">&larr;</span> Kembali ke daftar penitip
      </Link>
      
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">{consignor.name}</h1>
          <p className="text-base font-medium text-muted-foreground">
            {consignor.phone ? `Telepon: ${consignor.phone}` : "Belum ada nomor telepon terdaftar"}
          </p>
        </div>
        
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Suspense fallback={<div className="w-full md:w-64 h-11 bg-muted rounded-xl animate-pulse" />}>
            <DataTableSearch placeholder="Cari barang titipan..." />
          </Suspense>
          <div className="flex gap-2">
            <Link href={`/dashboard/settlements?consignorId=${consignor.id}`}>
              <Button variant="outline" className="h-11 px-5 rounded-xl font-bold text-[11px] uppercase tracking-wider border-border shadow-sm hover:bg-muted">
                Rekap Settlement
              </Button>
            </Link>
            <BatchDialog consignorId={consignor.id} />
          </div>
        </div>
      </div>

      <div className="relative z-10 overflow-hidden rounded-3xl bg-background/95 backdrop-blur-xl shadow-sm ring-1 ring-foreground/5">
        <div className="border-b border-foreground/5 p-6 md:px-8 md:py-6 bg-primary/[0.02]">
          <h2 className="text-xl font-bold tracking-tight">Titipan Aktif</h2>
          <p className="text-sm text-muted-foreground mt-1">Daftar barang titipan yang sedang berjalan dan belum selesai.</p>
        </div>
        
        <div className="overflow-x-auto p-2">
          <Table>
            <TableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="h-12 px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Barang</TableHead>
                <TableHead className="h-12 px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Tanggal Masuk</TableHead>
                <TableHead className="h-12 px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Titip / Laku / Retur</TableHead>
                <TableHead className="h-12 px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Fee</TableHead>
                <TableHead className="h-12 px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</TableHead>
                <TableHead className="h-12 px-6 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeBatches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
                    <p className="text-lg font-bold text-muted-foreground">Belum ada titipan aktif.</p>
                    <p className="text-sm font-medium text-muted-foreground/70">Tekan "Tambah Titipan" untuk mencatat barang dari penitip ini.</p>
                  </TableCell>
                </TableRow>
              )}
              {activeBatches.map((batch) => {
                const remaining = batch.qtyReceived - batch.qtySold - batch.qtyReturned;
                return (
                  <TableRow key={batch.id} className="group border-b-foreground/5 hover:bg-primary/[0.03] transition-colors">
                    <TableCell className="px-6 py-4 font-bold text-[15px]">{batch.productName}</TableCell>
                    <TableCell className="px-6 py-4 font-medium text-muted-foreground/80">{batch.dateReceived}</TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-foreground">{batch.qtyReceived}</span>
                        <span className="text-muted-foreground/40">/</span>
                        <span className="text-primary">{batch.qtySold}</span>
                        <span className="text-muted-foreground/40">/</span>
                        <span className="text-destructive">{batch.qtyReturned}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 font-bold text-muted-foreground/80">{batch.feePercent}%</TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge className="font-bold tracking-wider uppercase text-[10px] px-2.5 py-1 bg-primary text-primary-foreground hover:bg-primary/90 border-none shadow-sm">
                        Aktif
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end opacity-100 transition-opacity relative z-20">
                        {remaining > 0 && (
                          <ReturnBatchButton
                            batchId={batch.id}
                            consignorId={consignor.id}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <ServerPagination currentPage={activeCurPage} totalPages={activeTotalPages} paramName="activePage" limitParamName="activeLimit" currentLimit={ACTIVE_PAGE_SIZE} />
        </div>
      </div>

      {inactiveBatches.length > 0 && (
        <details className="group [&_summary::-webkit-details-marker]:hidden rounded-3xl bg-muted/30 border border-border/40 transition-colors hover:bg-muted/50 overflow-hidden">
          <summary className="flex cursor-pointer items-center justify-between p-6 font-extrabold tracking-tight text-foreground/80 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
            <span className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-sm transition-transform group-open:rotate-180">
                ▼
              </span>
              Riwayat Titipan Selesai ({inactiveBatches.length})
            </span>
          </summary>
          <div className="p-2 border-t border-border/40 bg-background/50">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="h-12 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Barang</TableHead>
                    <TableHead className="h-12 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tanggal Masuk</TableHead>
                    <TableHead className="h-12 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Titip / Laku / Retur</TableHead>
                    <TableHead className="h-12 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fee</TableHead>
                    <TableHead className="h-12 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inactiveBatches.map((batch) => (
                    <TableRow key={batch.id} className="border-b-foreground/5 opacity-70 hover:opacity-100 transition-opacity">
                      <TableCell className="px-6 py-3 font-semibold text-sm">{batch.productName}</TableCell>
                      <TableCell className="px-6 py-3 text-sm text-muted-foreground">{batch.dateReceived}</TableCell>
                      <TableCell className="px-6 py-3 font-medium text-sm">
                        {batch.qtyReceived} / {batch.qtySold} / {batch.qtyReturned}
                      </TableCell>
                      <TableCell className="px-6 py-3 text-sm">{batch.feePercent}%</TableCell>
                      <TableCell className="px-6 py-3">
                        <Badge variant="secondary" className="font-bold tracking-wider uppercase text-[9px] px-2 py-0.5 shadow-none bg-muted-foreground/10 text-muted-foreground border-none">
                          {batch.status === "active" ? "selesai" : batch.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ServerPagination currentPage={inactiveCurPage} totalPages={inactiveTotalPages} paramName="inactivePage" limitParamName="inactiveLimit" currentLimit={INACTIVE_PAGE_SIZE} />
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
