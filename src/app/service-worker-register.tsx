"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Service worker hanya didaftarkan di production — di development, cache-nya
    // bentrok dengan Fast Refresh/HMR dan bisa memicu reload loop.
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registrasi gagal (mis. browser lama) — aplikasi tetap jalan tanpa cache offline.
      });
    }
  }, []);

  return null;
}
