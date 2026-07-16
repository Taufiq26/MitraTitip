"use client";

import { useTransition } from "react";
import { returnConsignmentBatch } from "../actions";
import { Button } from "@/components/ui/button";

export function ReturnBatchButton({
  batchId,
  consignorId,
}: {
  batchId: string;
  consignorId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (confirm("Kembalikan sisa barang titipan ini ke penitip?")) {
          startTransition(() => {
            returnConsignmentBatch(batchId, consignorId);
          });
        }
      }}
    >
      Retur sisa
    </Button>
  );
}
