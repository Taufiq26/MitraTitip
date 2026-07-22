import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createAdminClient } from "@/lib/supabase/admin";

const feeSchema = z.object({
  fee_percent: z.number().min(0, "Persentase tidak boleh negatif").max(100, "Persentase maksimal 100"),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const profile = await getCurrentProfile();
  if (profile.role !== "super_admin") {
    return NextResponse.json({ success: false, data: null, error: "Tidak diizinkan" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = feeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, data: null, error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 422 },
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .update({ fee_percent: parsed.data.fee_percent })
    .eq("tenant_id", id)
    .select("tenant_id, fee_percent")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { success: false, data: null, error: "Tenant/subscription tidak ditemukan" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data, error: null });
}
