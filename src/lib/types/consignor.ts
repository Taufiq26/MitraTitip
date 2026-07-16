export interface Consignor {
  id: string;
  tenantId: string;
  name: string;
  phone: string | null;
  createdAt: string;
}

export interface ConsignorRow {
  id: string;
  tenant_id: string;
  name: string;
  phone: string | null;
  created_at: string;
}

export function mapConsignorRow(row: ConsignorRow): Consignor {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    phone: row.phone,
    createdAt: row.created_at,
  };
}
