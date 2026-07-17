export interface Settlement {
  id: string;
  consignorId: string;
  consignorName: string;
  periodStart: string;
  periodEnd: string;
  totalSales: number;
  totalFee: number;
  totalPayout: number;
  status: "draft" | "paid";
  createdAt: string;
}

export interface SettlementRow {
  id: string;
  consignor_id: string;
  period_start: string;
  period_end: string;
  total_sales: number;
  total_fee: number;
  total_payout: number;
  status: "draft" | "paid";
  created_at: string;
  consignors: { name: string } | null;
}

export function mapSettlementRow(row: SettlementRow): Settlement {
  return {
    id: row.id,
    consignorId: row.consignor_id,
    consignorName: row.consignors?.name ?? "Penitip",
    periodStart: row.period_start,
    periodEnd: row.period_end,
    totalSales: row.total_sales,
    totalFee: row.total_fee,
    totalPayout: row.total_payout,
    status: row.status,
    createdAt: row.created_at,
  };
}
