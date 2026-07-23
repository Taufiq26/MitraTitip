"use client";

import { useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: Record<string, unknown>) => void;
    };
  }
}

interface PayInvoiceButtonProps {
  invoiceId: string;
  clientKey: string;
  isProduction: boolean;
}

export function PayInvoiceButton({ invoiceId, clientKey, isProduction }: PayInvoiceButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const snapUrl = isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  async function handlePay() {
    setIsPending(true);
    setError(null);

    const res = await fetch(`/api/tenant/billing/${invoiceId}/pay`, { method: "POST" });
    const json = await res.json();
    setIsPending(false);

    if (!json.success) {
      setError(json.error ?? "Gagal memulai pembayaran");
      return;
    }

    if (window.snap) {
      window.snap.pay(json.data.snap_token, {
        onSuccess: () => window.location.reload(),
        onPending: () => window.location.reload(),
      });
    } else {
      window.location.href = json.data.redirect_url;
    }
  }

  return (
    <div>
      <Script src={snapUrl} data-client-key={clientKey} strategy="afterInteractive" />
      <Button onClick={handlePay} disabled={isPending} className="h-14 w-full text-base font-bold shadow-md transition-transform active:scale-[0.98]">
        {isPending ? "Memproses..." : "Bayar Sekarang"}
      </Button>
      {error && <p className="mt-2 text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
