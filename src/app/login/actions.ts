"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: string | null };

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "Email atau password salah." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email_verified_at")
    .eq("id", data.user.id)
    .single();

  if (profile?.role === "admin" && !profile.email_verified_at) {
    await supabase.auth.signOut();
    return {
      error: "Email belum diverifikasi. Cek inbox Anda atau minta kirim ulang dari halaman pendaftaran.",
    };
  }

  if (profile?.role === "super_admin") {
    redirect("/super-admin");
  }

  redirect("/dashboard");
}
