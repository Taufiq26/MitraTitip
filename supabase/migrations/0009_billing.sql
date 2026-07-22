-- MitraTitip: Fondasi billing berbasis persentase pendapatan bersih
-- Referensi: docs/core/database.md, docs/core/requirements.md (FR-23..FR-31)

alter table tenants add column whatsapp_number text not null default '';

alter table profiles add column email_verification_token text unique;
alter table profiles add column email_verification_sent_at timestamptz;
alter table profiles add column email_verified_at timestamptz;

-- Akun yang sudah ada sebelum fitur ini (dibuat manual/testing) dianggap terverifikasi
-- agar tidak terkunci retroaktif oleh syarat verifikasi email baru.
update profiles set email_verified_at = created_at where email_verified_at is null;

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique references tenants(id) on delete cascade,
  fee_percent numeric not null default 2,
  trial_end date not null,
  status text not null default 'trial' check (status in ('trial', 'active', 'grace', 'suspended')),
  created_at timestamptz not null default now()
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  net_revenue numeric not null,
  fee_percent_snapshot numeric not null,
  amount_due numeric not null,
  due_date date not null,
  grace_end date not null,
  status text not null default 'draft' check (status in ('draft', 'unpaid', 'paid', 'overdue', 'manual_paid')),
  paid_at timestamptz,
  midtrans_order_id text unique,
  midtrans_transaction_id text,
  marked_paid_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index invoices_tenant_id_idx on invoices(tenant_id);
create index invoices_status_idx on invoices(status);

-- Tenant yang sudah ada sebelum fitur ini dibuatkan subscription trial,
-- supaya tidak ada tenant tanpa baris subscription.
insert into subscriptions (tenant_id, trial_end)
select id, (current_date + interval '1 month')::date
from tenants
where id not in (select tenant_id from subscriptions);

alter table subscriptions enable row level security;
alter table invoices enable row level security;

create policy subscriptions_select on subscriptions for select
  using (auth_role() = 'super_admin' or tenant_id = auth_tenant_id());

create policy invoices_select on invoices for select
  using (auth_role() = 'super_admin' or tenant_id = auth_tenant_id());
