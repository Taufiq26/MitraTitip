export type ConsignmentBatchStatus = "active" | "settled" | "returned";

export interface ConsignmentBatch {
  id: string;
  tenantId: string;
  productId: string;
  consignorId: string;
  qtyReceived: number;
  qtySold: number;
  qtyReturned: number;
  feePercent: number;
  dateReceived: string;
  status: ConsignmentBatchStatus;
  productName?: string;
}

export interface ConsignmentBatchRow {
  id: string;
  tenant_id: string;
  product_id: string;
  consignor_id: string;
  qty_received: number;
  qty_sold: number;
  qty_returned: number;
  fee_percent: number;
  date_received: string;
  status: ConsignmentBatchStatus;
  products?: { name: string } | null;
}

export function mapConsignmentBatchRow(
  row: ConsignmentBatchRow,
): ConsignmentBatch {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    productId: row.product_id,
    consignorId: row.consignor_id,
    qtyReceived: row.qty_received,
    qtySold: row.qty_sold,
    qtyReturned: row.qty_returned,
    feePercent: row.fee_percent,
    dateReceived: row.date_received,
    status: row.status,
    productName: row.products?.name,
  };
}
