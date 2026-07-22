"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Tautan verifikasi tidak valid.");
      return;
    }

    fetch(`/api/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(json.error ?? "Gagal memverifikasi email.");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMessage("Gagal memverifikasi email.");
      });
  }, [token]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
      <div className="mx-auto w-full max-w-sm space-y-6">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
            <p className="text-base text-muted-foreground">Memverifikasi email Anda...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <div className="space-y-1.5">
              <h2 className="text-3xl font-extrabold tracking-tight">Email Terverifikasi</h2>
              <p className="text-base text-muted-foreground">Akun Anda sudah aktif. Silakan masuk untuk mulai menggunakan MitraTitip.</p>
            </div>
            <Link href="/login" className="inline-block font-medium text-foreground underline underline-offset-4">
              Masuk ke Sistem
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <div className="space-y-1.5">
              <h2 className="text-3xl font-extrabold tracking-tight">Verifikasi Gagal</h2>
              <p className="text-base text-muted-foreground">{errorMessage}</p>
            </div>
            <Link href="/login" className="inline-block font-medium text-foreground underline underline-offset-4">
              Kembali ke Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
