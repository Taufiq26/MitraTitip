-- MitraTitip: Row Level Security untuk isolasi data per tenant
-- Referensi: docs/core/database.md, docs/core/requirements.md (FR-22, NFR-1)

create or replace function auth_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from profiles where id = auth.uid();
$$;

create or replace function auth_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

alter table tenants enable row level security;
alter table profiles enable row level security;
alter table products enable row level security;
alter table consignors enable row level security;
alter table consignment_batches enable row level security;
alter table transactions enable row level security;
alter table transaction_items enable row level security;
alter table settlements enable row level security;

-- tenants: super_admin melihat semua; admin/kasir hanya tenant sendiri
create policy tenants_select on tenants for select
  using (auth_role() = 'super_admin' or id = auth_tenant_id());

-- profiles: user melihat profile satu tenant dengan dirinya; super_admin melihat semua
create policy profiles_select on profiles for select
  using (auth_role() = 'super_admin' or tenant_id = auth_tenant_id());

create policy profiles_insert_self on profiles for insert
  with check (id = auth.uid());

-- Tabel tenant-scoped: pola sama untuk semua operasi CRUD
create policy products_all on products for all
  using (tenant_id = auth_tenant_id())
  with check (tenant_id = auth_tenant_id());

create policy consignors_all on consignors for all
  using (tenant_id = auth_tenant_id())
  with check (tenant_id = auth_tenant_id());

create policy consignment_batches_all on consignment_batches for all
  using (tenant_id = auth_tenant_id())
  with check (tenant_id = auth_tenant_id());

create policy transactions_all on transactions for all
  using (tenant_id = auth_tenant_id())
  with check (tenant_id = auth_tenant_id());

create policy settlements_all on settlements for all
  using (tenant_id = auth_tenant_id())
  with check (tenant_id = auth_tenant_id());

-- transaction_items tidak punya tenant_id langsung; validasi lewat transaction induk
create policy transaction_items_all on transaction_items for all
  using (
    exists (
      select 1 from transactions t
      where t.id = transaction_items.transaction_id
        and t.tenant_id = auth_tenant_id()
    )
  )
  with check (
    exists (
      select 1 from transactions t
      where t.id = transaction_items.transaction_id
        and t.tenant_id = auth_tenant_id()
    )
  );
