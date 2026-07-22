import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/mailgun";
import { verificationEmailHtml } from "@/lib/email/templates";
import { generateVerificationToken } from "@/lib/auth/verification-token";

const registerSchema = z.object({
  tenant_name: z.string().trim().min(2, "Nama toko minimal 2 karakter"),
  admin_email: z.string().trim().email("Email tidak valid"),
  admin_password: z.string().min(8, "Password minimal 8 karakter"),
  admin_name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  whatsapp_number: z.string().trim().min(8, "Nomor WhatsApp tidak valid"),
});

const TRIAL_DAYS = 30;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: parsed.error.issues[0]?.message ?? "Data tidak valid",
      },
      { status: 422 },
    );
  }

  const { tenant_name, admin_email, admin_password, admin_name, whatsapp_number } =
    parsed.data;
  const supabase = createAdminClient();

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({ name: tenant_name, whatsapp_number })
    .select("id")
    .single();

  if (tenantError || !tenant) {
    return NextResponse.json(
      { success: false, data: null, error: "Gagal membuat tenant" },
      { status: 500 },
    );
  }

  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email: admin_email,
      password: admin_password,
      email_confirm: true,
    });

  if (authError || !authUser.user) {
    await supabase.from("tenants").delete().eq("id", tenant.id);
    const message =
      authError?.code === "email_exists"
        ? "Email sudah terdaftar"
        : "Gagal membuat akun admin";
    return NextResponse.json(
      { success: false, data: null, error: message },
      { status: authError?.code === "email_exists" ? 422 : 500 },
    );
  }

  const verificationToken = generateVerificationToken();

  const { error: profileError } = await supabase.from("profiles").insert({
    id: authUser.user.id,
    tenant_id: tenant.id,
    role: "admin",
    full_name: admin_name,
    email_verification_token: verificationToken,
    email_verification_sent_at: new Date().toISOString(),
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(authUser.user.id);
    await supabase.from("tenants").delete().eq("id", tenant.id);
    return NextResponse.json(
      { success: false, data: null, error: "Gagal membuat profil admin" },
      { status: 500 },
    );
  }

  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);

  const { error: subscriptionError } = await supabase.from("subscriptions").insert({
    tenant_id: tenant.id,
    trial_end: trialEnd.toISOString().slice(0, 10),
  });

  if (subscriptionError) {
    await supabase.auth.admin.deleteUser(authUser.user.id);
    await supabase.from("tenants").delete().eq("id", tenant.id);
    return NextResponse.json(
      { success: false, data: null, error: "Gagal membuat langganan trial" },
      { status: 500 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.headers.get("origin") ?? "";
  const verifyUrl = `${appUrl}/verify-email?token=${verificationToken}`;

  try {
    await sendEmail({
      to: admin_email,
      subject: "Verifikasi email MitraTitip Anda",
      html: verificationEmailHtml({ adminName: admin_name, tenantName: tenant_name, verifyUrl }),
    });
  } catch {
    // Registrasi tetap berhasil walau pengiriman email gagal; pengguna bisa minta kirim ulang
    // dari halaman "cek email" (lihat /api/verify-email/resend).
  }

  return NextResponse.json({
    success: true,
    data: { tenant_id: tenant.id, user_id: authUser.user.id },
    error: null,
  });
}
