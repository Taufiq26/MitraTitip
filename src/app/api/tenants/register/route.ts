import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const registerSchema = z.object({
  tenant_name: z.string().trim().min(2, "Nama toko minimal 2 karakter"),
  admin_email: z.string().trim().email("Email tidak valid"),
  admin_password: z.string().min(8, "Password minimal 8 karakter"),
  admin_name: z.string().trim().min(2, "Nama minimal 2 karakter"),
});

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

  const { tenant_name, admin_email, admin_password, admin_name } =
    parsed.data;
  const supabase = createAdminClient();

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({ name: tenant_name })
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

  const { error: profileError } = await supabase.from("profiles").insert({
    id: authUser.user.id,
    tenant_id: tenant.id,
    role: "admin",
    full_name: admin_name,
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(authUser.user.id);
    await supabase.from("tenants").delete().eq("id", tenant.id);
    return NextResponse.json(
      { success: false, data: null, error: "Gagal membuat profil admin" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    data: { tenant_id: tenant.id, user_id: authUser.user.id },
    error: null,
  });
}
