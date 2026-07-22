"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MailCheck } from "lucide-react";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleResend() {
    setStatus("sending");
    setMessage(null);

    const res = await fetch("/api/verify-email/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();

    if (!json.success) {
      setStatus("error");
      setMessage(json.error ?? "Gagal mengirim ulang email.");
      return;
    }

    setStatus("sent");
    setMessage(json.data?.already_verified ? "Email Anda sudah terverifikasi." : "Email verifikasi baru sudah dikirim.");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <MailCheck className="mx-auto h-12 w-12 text-primary" />
        <div className="space-y-1.5">
          <h2 className="text-3xl font-extrabold tracking-tight">Cek Email Anda</h2>
          <p className="text-base text-muted-foreground">
            Kami sudah mengirim tautan verifikasi ke <strong>{email || "email Anda"}</strong>. Buka email tersebut dan klik tautannya untuk mengaktifkan akun.
          </p>
        </div>

        {message && (
          <p className={`text-sm font-medium ${status === "error" ? "text-destructive" : "text-muted-foreground"}`}>
            {message}
          </p>
        )}

        <Button onClick={handleResend} disabled={status === "sending"} variant="outline" className="h-12 w-full">
          {status === "sending" ? "Mengirim..." : "Kirim Ulang Email"}
        </Button>

        <p className="text-center text-base text-muted-foreground">
          Sudah verifikasi?{" "}
          <Link href="/login" className="font-medium text-foreground/70 transition-colors hover:text-foreground underline underline-offset-4">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense>
      <CheckEmailContent />
    </Suspense>
  );
}
