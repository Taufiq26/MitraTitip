"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

const createUserSchema = z.object({
  fullName: z.string().min(2, "Nama terlalu pendek"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function createKasir(prevState: any, formData: FormData) {
  const profile = await getCurrentProfile();
  if (profile.role !== "admin") {
    return { success: false, error: "Akses ditolak" };
  }

  const parsed = createUserSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const { fullName, email, password, phone, address } = parsed.data;
  const supabase = createAdminClient();

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    return { 
      success: false, 
      error: authError?.code === "email_exists" ? "Email sudah terdaftar" : "Gagal membuat akun" 
    };
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: authUser.user.id,
    tenant_id: profile.tenantId,
    role: "kasir",
    full_name: fullName,
    phone: phone || null,
    address: address || null,
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(authUser.user.id);
    return { success: false, error: "Gagal menyimpan profil: " + profileError.message };
  }

  revalidatePath("/dashboard/users");
  return { success: true, error: null };
}
