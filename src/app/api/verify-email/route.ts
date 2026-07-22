import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isTokenExpired } from "@/lib/auth/verification-token";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { success: false, data: null, error: "Token tidak ditemukan" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email_verification_sent_at, email_verified_at")
    .eq("email_verification_token", token)
    .maybeSingle();

  if (error || !profile) {
    return NextResponse.json(
      { success: false, data: null, error: "Token tidak valid atau sudah dipakai" },
      { status: 400 },
    );
  }

  if (profile.email_verified_at) {
    return NextResponse.json({ success: true, data: { verified: true }, error: null });
  }

  if (isTokenExpired(profile.email_verification_sent_at)) {
    return NextResponse.json(
      { success: false, data: null, error: "Token sudah kedaluwarsa, minta kirim ulang" },
      { status: 410 },
    );
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ email_verified_at: new Date().toISOString(), email_verification_token: null })
    .eq("id", profile.id);

  if (updateError) {
    return NextResponse.json(
      { success: false, data: null, error: "Gagal memverifikasi email" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data: { verified: true }, error: null });
}
