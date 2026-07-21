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

export default async function ConsignorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const profile = await getCurrentProfile();
  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  let query = supabase.from("consignors").select("*").order("name");

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data } = await query.returns<ConsignorRow[]>();

  const consignors = (data ?? []).map(mapConsignorRow);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold">Penitip</h1>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Suspense fallback={<div className="w-full max-w-sm h-9 bg-muted rounded-md animate-pulse" />}>
            <DataTableSearch placeholder="Cari penitip..." />
          </Suspense>
          <ConsignorDialog />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Telepon</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {consignors.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                Belum ada penitip. Tambahkan penitip pertama Anda.
              </TableCell>
            </TableRow>
          )}
          {consignors.map((consignor) => (
            <ClickableTableRow key={consignor.id} href={`/dashboard/consignors/${consignor.id}`}>
              <TableCell className="font-medium">
                {consignor.name}
              </TableCell>
              <TableCell>{consignor.phone ?? "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <BatchDialog consignorId={consignor.id} />
                  <ConsignorDialog consignor={consignor} />
                  <DeleteConsignorButton consignorId={consignor.id} />
                </div>
              </TableCell>
            </ClickableTableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
