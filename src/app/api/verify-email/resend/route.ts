import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/mailgun";
import { verificationEmailHtml } from "@/lib/email/templates";
import { generateVerificationToken } from "@/lib/auth/verification-token";

const resendSchema = z.object({
  email: z.string().trim().email("Email tidak valid"),
});

const RESEND_COOLDOWN_SECONDS = 60;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = resendSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, data: null, error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 422 },
    );
  }

  const supabase = createAdminClient();

  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const authUser = authUsers.users.find((u) => u.email === parsed.data.email);

  if (!authUser) {
    return NextResponse.json(
      { success: false, data: null, error: "Email tidak ditemukan" },
      { status: 404 },
    );
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, tenant_id, email_verified_at, email_verification_sent_at, tenants(name)")
    .eq("id", authUser.id)
    .single();

  if (error || !profile) {
    return NextResponse.json(
      { success: false, data: null, error: "Email tidak ditemukan" },
      { status: 404 },
    );
  }

  if (profile.email_verified_at) {
    return NextResponse.json({ success: true, data: { sent: false, already_verified: true }, error: null });
  }

  if (profile.email_verification_sent_at) {
    const secondsSinceLastSend =
      (Date.now() - new Date(profile.email_verification_sent_at).getTime()) / 1000;
    if (secondsSinceLastSend < RESEND_COOLDOWN_SECONDS) {
      return NextResponse.json(
        { success: false, data: null, error: "Tunggu sebentar sebelum meminta kirim ulang" },
        { status: 429 },
      );
    }
  }

  const verificationToken = generateVerificationToken();

  await supabase
    .from("profiles")
    .update({
      email_verification_token: verificationToken,
      email_verification_sent_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.headers.get("origin") ?? "";
  const verifyUrl = `${appUrl}/verify-email?token=${verificationToken}`;
  const tenantName = (profile as unknown as { tenants: { name: string } | null }).tenants?.name ?? "toko Anda";

  await sendEmail({
    to: parsed.data.email,
    subject: "Verifikasi email MitraTitip Anda",
    html: verificationEmailHtml({ adminName: profile.full_name, tenantName, verifyUrl }),
  });

  return NextResponse.json({ success: true, data: { sent: true }, error: null });
}
