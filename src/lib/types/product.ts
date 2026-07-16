export interface Product {
  id: string;
  tenantId: string;
  name: string;
  barcode: string | null;
  category: string | null;
  costPrice: number;
  sellPrice: number;
  trackStock: boolean;
  stockQty: number;
  lowStockThreshold: number | null;
  isConsignment: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRow {
  id: string;
  tenant_id: string;
  name: string;
  barcode: string | null;
  category: string | null;
  cost_price: number;
  sell_price: number;
  track_stock: boolean;
  stock_qty: number;
  low_stock_threshold: number | null;
  is_consignment: boolean;
  created_at: string;
  updated_at: string;
}

export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    barcode: row.barcode,
    category: row.category,
    costPrice: row.cost_price,
    sellPrice: row.sell_price,
    trackStock: row.track_stock,
    stockQty: row.stock_qty,
    lowStockThreshold: row.low_stock_threshold,
    isConsignment: row.is_consignment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
