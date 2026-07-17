import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { mapConsignorRow, type ConsignorRow } from "@/lib/types/consignor";
import { ConsignorDialog } from "./consignor-dialog";
import { DeleteConsignorButton } from "./delete-consignor-button";
import { BatchDialog } from "./[id]/batch-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ConsignorsPage() {
  const profile = await getCurrentProfile();
  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("consignors")
    .select("*")
    .order("name")
    .returns<ConsignorRow[]>();

  const consignors = (data ?? []).map(mapConsignorRow);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Penitip</h1>
        <ConsignorDialog />
      </div>
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
            <TableRow key={consignor.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/dashboard/consignors/${consignor.id}`}
                  className="hover:underline"
                >
                  {consignor.name}
                </Link>
              </TableCell>
              <TableCell>{consignor.phone ?? "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <BatchDialog consignorId={consignor.id} />
                  <ConsignorDialog consignor={consignor} />
                  <DeleteConsignorButton consignorId={consignor.id} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
