import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { mapConsignorRow, type ConsignorRow } from "@/lib/types/consignor";
import { SettlementForm } from "./settlement-form";

export default async function SettlementsPage({
  searchParams,
}: {
  searchParams: Promise<{ consignorId?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  const { consignorId } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("consignors")
    .select("*")
    .order("name")
    .returns<ConsignorRow[]>();

  const consignors = (data ?? []).map(mapConsignorRow);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Rekap Settlement Titipan</h1>
      <SettlementForm consignors={consignors} defaultConsignorId={consignorId} />
    </div>
  );
}
