import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { mapConsignorRow, type ConsignorRow } from "@/lib/types/consignor";
import { ConsignorDialog } from "./consignor-dialog";
import { DeleteConsignorButton } from "./delete-consignor-button";
import { BatchDialog } from "./[id]/batch-dialog";
import { DataTableSearch } from "@/components/ui/data-table-search";
import { Suspense } from "react";
import { ClickableTableRow } from "@/components/ui/clickable-table-row";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServerPagination } from "@/components/ui/server-pagination";

export default async function ConsignorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; limit?: string }>;
}) {
  const { q, page, limit } = await searchParams;
  const currentPage = parseInt(page || "1", 10);
  const PAGE_SIZE = parseInt(limit || "20", 10);

  const profile = await getCurrentProfile();
  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase.from("consignors").select("*", { count: "exact" }).order("name").range(from, to);

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data, count } = await query.returns<ConsignorRow[]>();
  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1;

  const consignors = (data ?? []).map(mapConsignorRow);

  return (
    <div className="relative space-y-8">
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Daftar Penitip</h1>
          <p className="text-base font-medium text-muted-foreground">Kelola mitra penitip (consignors) dan riwayat titipan mereka.</p>
        </div>
        <ConsignorDialog />
      </div>

      <div className="relative z-10 overflow-hidden rounded-3xl bg-background/95 backdrop-blur-xl shadow-sm ring-1 ring-foreground/5">
        <div className="border-b border-foreground/5 p-6 md:px-8 md:py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-primary/[0.02]">
          <Suspense fallback={<div className="w-full max-w-sm h-10 bg-muted rounded-xl animate-pulse" />}>
            <DataTableSearch placeholder="Cari nama atau telepon..." />
          </Suspense>
        </div>
        
        <div className="overflow-x-auto p-2">
          <Table>
            <TableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="h-12 px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Nama Penitip</TableHead>
                <TableHead className="h-12 px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Nomor Telepon</TableHead>
                <TableHead className="h-12 px-6 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consignors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-12 text-center">
                    <p className="text-lg font-bold text-muted-foreground">Belum ada mitra.</p>
                    <p className="text-sm font-medium text-muted-foreground/70">Tambahkan penitip pertama Anda ke dalam sistem.</p>
                  </TableCell>
                </TableRow>
              )}
              {consignors.map((consignor) => (
                <ClickableTableRow key={consignor.id} href={`/dashboard/consignors/${consignor.id}`} className="group border-b-foreground/5 hover:bg-primary/[0.03] transition-colors">
                  <TableCell className="px-6 py-4">
                    <span className="text-[15px] font-bold text-foreground">{consignor.name}</span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="text-[13px] font-medium text-muted-foreground/70">{consignor.phone || "Tidak ada nomor"}</span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity relative z-20">
                      <BatchDialog consignorId={consignor.id} />
                      <ConsignorDialog consignor={consignor} />
                      <DeleteConsignorButton consignorId={consignor.id} />
                    </div>
                  </TableCell>
                </ClickableTableRow>
              ))}
            </TableBody>
          </Table>
          <ServerPagination currentPage={currentPage} totalPages={totalPages} currentLimit={PAGE_SIZE} />
        </div>
      </div>
    </div>
  );
}
