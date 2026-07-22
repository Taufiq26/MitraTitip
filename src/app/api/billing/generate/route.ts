import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateDueInvoices } from "@/lib/billing/generate-invoices";

/**
 * Dipanggil oleh Vercel Cron (lihat vercel.json) sebulan sekali. Vercel mengirim
 * request GET dengan header Authorization: Bearer $CRON_SECRET saat env var itu diset.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  try {
    const result = await generateDueInvoices(supabase);
    return NextResponse.json({ success: true, data: result, error: null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal generate invoice";
    return NextResponse.json({ success: false, data: null, error: message }, { status: 500 });
  }
}
