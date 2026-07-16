"use client";

import { useTransition } from "react";
import { deleteConsignor } from "./actions";
import { Button } from "@/components/ui/button";

export function DeleteConsignorButton({ consignorId }: { consignorId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (confirm("Hapus penitip ini?")) {
          startTransition(() => {
            deleteConsignor(consignorId);
          });
        }
      }}
    >
      Hapus
    </Button>
  );
}
