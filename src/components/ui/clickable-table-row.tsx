"use client";

import { useRouter } from "next/navigation";
import { TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface ClickableTableRowProps extends React.ComponentProps<typeof TableRow> {
  href: string;
}

export function ClickableTableRow({ href, className, children, ...props }: ClickableTableRowProps) {
  const router = useRouter();
  
  return (
    <TableRow
      className={cn("cursor-pointer", className)}
      onClick={(e) => {
        // Prevent navigation if user clicked a button, a link, or something inside a dialog/dropdown
        if (
          e.target instanceof HTMLElement &&
          (e.target.closest("button") || e.target.closest("a") || e.target.closest("[role='menuitem']"))
        ) {
          return;
        }
        router.push(href);
      }}
      {...props}
    >
      {children}
    </TableRow>
  );
}
