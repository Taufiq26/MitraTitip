-- MitraTitip: skema awal (Phase 1)
-- Referensi: docs/core/database.md

create extension if not exists "pgcrypto";

-- =========================================================
-- tenants
-- =========================================================
create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- profiles (1:1 dengan auth.users)
-- =========================================================
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  tenant_id uuid references tenants (id) on delete cascade,
  role text not null check (role in ('super_admin', 'admin', 'kasir')),
  full_name text not null,
  created_at timestamptz not null default now(),
  constraint profiles_tenant_required_unless_super_admin
    check (role = 'super_admin' or tenant_id is not null)
);

create index profiles_tenant_id_idx on profiles (tenant_id);

-- =========================================================
-- products
-- =========================================================
create table products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  name text not null,
  barcode text,
  category text,
  cost_price numeric(14, 2) not null default 0,
  sell_price numeric(14, 2) not null,
  track_stock boolean not null default true,
  stock_qty numeric(14, 2) not null default 0,
  low_stock_threshold numeric(14, 2),
  is_consignment boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, barcode)
);

create index products_tenant_id_idx on products (tenant_id);

-- =========================================================
-- consignors (penitip)
-- =========================================================
create table consignors (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  name text not null,
  phone text,
  created_at timestamptz not null default now()
);

create index consignors_tenant_id_idx on consignors (tenant_id);

-- =========================================================
-- consignment_batches (titipan harian per produk)
-- =========================================================
create table consignment_batches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  consignor_id uuid not null references consignors (id) on delete cascade,
  qty_received numeric(14, 2) not null,
  qty_sold numeric(14, 2) not null default 0,
  qty_returned numeric(14, 2) not null default 0,
  fee_percent numeric(5, 2) not null default 10,
  date_received date not null,
  status text not null default 'active' check (status in ('active', 'settled', 'returned')),
  constraint consignment_batches_qty_within_received
    check (qty_sold + qty_returned <= qty_received)
);

create index consignment_batches_tenant_id_idx on consignment_batches (tenant_id);
create index consignment_batches_consignor_id_idx on consignment_batches (consignor_id);

-- =========================================================
-- transactions
-- =========================================================
create table transactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  cashier_id uuid not null references profiles (id),
  local_id text not null,
  total_amount numeric(14, 2) not null,
  payment_method text not null check (payment_method in ('cash', 'qris', 'transfer')),
  cash_received numeric(14, 2),
  change_amount numeric(14, 2),
  sync_status text not null default 'synced' check (sync_status in ('synced', 'pending')),
  created_at timestamptz not null default now(),
  unique (tenant_id, local_id)
);

create index transactions_tenant_id_idx on transactions (tenant_id);
create index transactions_created_at_idx on transactions (created_at);

-- =========================================================
-- transaction_items
-- =========================================================
create table transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions (id) on delete cascade,
  product_id uuid not null references products (id),
  consignment_batch_id uuid references consignment_batches (id),
  qty numeric(14, 2) not null,
  unit_price numeric(14, 2) not null,
  cost_price_snapshot numeric(14, 2) not null,
  fee_percent_snapshot numeric(5, 2),
  subtotal numeric(14, 2) not null
);

create index transaction_items_transaction_id_idx on transaction_items (transaction_id);

-- =========================================================
-- settlements (rekap pembayaran ke penitip)
-- =========================================================
create table settlements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  consignor_id uuid not null references consignors (id) on delete cascade,
  period_start date not null,
  period_end date not null,
  total_sales numeric(14, 2) not null,
  total_fee numeric(14, 2) not null,
  total_payout numeric(14, 2) not null,
  status text not null default 'draft' check (status in ('draft', 'paid')),
  created_at timestamptz not null default now()
);

create index settlements_tenant_id_idx on settlements (tenant_id);
