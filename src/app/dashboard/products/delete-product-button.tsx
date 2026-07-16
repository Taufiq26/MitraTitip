"use client";

import { useTransition } from "react";
import { deleteProduct } from "./actions";
import { Button } from "@/components/ui/button";

export function DeleteProductButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (confirm("Hapus produk ini?")) {
          startTransition(() => {
            deleteProduct(productId);
          });
        }
      }}
    >
      Hapus
    </Button>
  );
}
