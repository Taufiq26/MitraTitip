"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registrasi gagal (mis. browser lama) — aplikasi tetap jalan tanpa cache offline.
      });
    }
  }, []);

  return null;
}
