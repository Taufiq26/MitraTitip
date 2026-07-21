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
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ConsignorDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id } = await params;
  const { q } = await searchParams;
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

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/consignors"
        className="text-sm text-muted-foreground hover:underline inline-block mb-2"
      >
        &larr; Kembali ke daftar penitip
      </Link>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{consignor.name}</h1>
          {consignor.phone && (
            <p className="text-sm text-muted-foreground">{consignor.phone}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Suspense fallback={<div className="w-full max-w-sm h-9 bg-muted rounded-md animate-pulse" />}>
            <DataTableSearch placeholder="Cari nama barang..." />
          </Suspense>
          <div className="flex gap-2">
            <Link href={`/dashboard/settlements?consignorId=${consignor.id}`}>
              <Button variant="outline" size="sm" className="h-9">
                Rekap Settlement
              </Button>
            </Link>
            <BatchDialog consignorId={consignor.id} />
          </div>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>

        <TableHeader>
          <TableRow>
            <TableHead>Barang</TableHead>
            <TableHead>Tanggal titip</TableHead>
            <TableHead>Titip / Terjual / Retur</TableHead>
            <TableHead>Fee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batches.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Belum ada titipan dari penitip ini.
              </TableCell>
            </TableRow>
          )}
          {batches.map((batch) => {
            const remaining = batch.qtyReceived - batch.qtySold - batch.qtyReturned;
            return (
              <TableRow key={batch.id}>
                <TableCell className="font-medium">{batch.productName}</TableCell>
                <TableCell>{batch.dateReceived}</TableCell>
                <TableCell>
                  {batch.qtyReceived} / {batch.qtySold} / {batch.qtyReturned}
                </TableCell>
                <TableCell>{batch.feePercent}%</TableCell>
                <TableCell>
                  <Badge variant={batch.status === "active" ? "default" : "secondary"}>
                    {batch.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {batch.status === "active" && remaining > 0 && (
                    <ReturnBatchButton
                      batchId={batch.id}
                      consignorId={consignor.id}
                    />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
