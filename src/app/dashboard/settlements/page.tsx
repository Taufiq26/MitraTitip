import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { mapConsignorRow, type ConsignorRow } from "@/lib/types/consignor";
import { mapSettlementRow, type SettlementRow } from "@/lib/types/settlement";
import { SettlementForm } from "./settlement-form";
import { SettlementHistory } from "./settlement-history";

export default async function SettlementsPage({
  searchParams,
}: {
  searchParams: Promise<{ consignorId?: string; q?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  const { consignorId, q } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("consignors")
    .select("*")
    .order("name")
    .returns<ConsignorRow[]>();

  const consignors = (data ?? []).map(mapConsignorRow);

  let settlementQuery = supabase
    .from("settlements")
    .select("*, consignors!inner(name)")
    .order("created_at", { ascending: false });

  if (q) {
    settlementQuery = settlementQuery.ilike("consignors.name", `%${q}%`);
  }

  const { data: settlementRows } = await settlementQuery.returns<SettlementRow[]>();

  const settlements = (settlementRows ?? []).map(mapSettlementRow);

  return (
    <div className="relative space-y-8">
      <div className="relative z-10 flex flex-col gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Rekap Settlement Titipan</h1>
          <p className="text-base font-medium text-muted-foreground mt-2">
            Pilih penitip dan periode untuk melihat dan merealisasikan penyelesaian pembayaran hasil penjualan.
          </p>
        </div>
      </div>
      
      <SettlementForm consignors={consignors} defaultConsignorId={consignorId} />
      <SettlementHistory settlements={settlements} />
    </div>
  );
}
