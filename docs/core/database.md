# Database Design

## ERD

```mermaid
erDiagram
    TENANTS ||--o{ PROFILES : has
    TENANTS ||--o{ PRODUCTS : owns
    TENANTS ||--o{ CONSIGNORS : owns
    TENANTS ||--o{ TRANSACTIONS : owns
    CONSIGNORS ||--o{ CONSIGNMENT_BATCHES : supplies
    PRODUCTS ||--o{ CONSIGNMENT_BATCHES : "is consignment of"
    PROFILES ||--o{ TRANSACTIONS : records
    TRANSACTIONS ||--o{ TRANSACTION_ITEMS : contains
    PRODUCTS ||--o{ TRANSACTION_ITEMS : "sold as"
    CONSIGNMENT_BATCHES ||--o{ TRANSACTION_ITEMS : "sold from"
    CONSIGNORS ||--o{ SETTLEMENTS : "paid via"
    TENANTS ||--o| SUBSCRIPTIONS : has
    TENANTS ||--o{ INVOICES : billed

    TENANTS {
        uuid id PK
        text name
        text whatsapp_number
        timestamptz created_at
    }
    PROFILES {
        uuid id PK
        uuid tenant_id FK
        text role
        text full_name
        text email_verification_token
        timestamptz email_verification_sent_at
        timestamptz email_verified_at
        timestamptz created_at
    }
    PRODUCTS {
        uuid id PK
        uuid tenant_id FK
        text name
        text barcode
        text category
        numeric cost_price
        numeric sell_price
        boolean track_stock
        numeric stock_qty
        numeric low_stock_threshold
        boolean is_consignment
        timestamptz created_at
    }
    CONSIGNORS {
        uuid id PK
        uuid tenant_id FK
        text name
        text phone
        timestamptz created_at
    }
    CONSIGNMENT_BATCHES {
        uuid id PK
        uuid tenant_id FK
        uuid product_id FK
        uuid consignor_id FK
        numeric qty_received
        numeric qty_sold
        numeric qty_returned
        numeric fee_percent
        date date_received
        text status
    }
    TRANSACTIONS {
        uuid id PK
        uuid tenant_id FK
        uuid cashier_id FK
        text local_id
        numeric total_amount
        text payment_method
        numeric cash_received
        numeric change_amount
        text sync_status
        timestamptz created_at
    }
    TRANSACTION_ITEMS {
        uuid id PK
        uuid transaction_id FK
        uuid product_id FK
        uuid consignment_batch_id FK
        numeric qty
        numeric unit_price
        numeric cost_price_snapshot
        numeric fee_percent_snapshot
        numeric subtotal
    }
    SETTLEMENTS {
        uuid id PK
        uuid tenant_id FK
        uuid consignor_id FK
        date period_start
        date period_end
        numeric total_sales
        numeric total_fee
        numeric total_payout
        text status
        timestamptz created_at
    }
    SUBSCRIPTIONS {
        uuid id PK
        uuid tenant_id FK
        numeric fee_percent
        date trial_end
        text status
        timestamptz created_at
    }
    INVOICES {
        uuid id PK
        uuid tenant_id FK
        date period_start
        date period_end
        numeric net_revenue
        numeric fee_percent_snapshot
        numeric amount_due
        date due_date
        date grace_end
        text status
        timestamptz paid_at
        text midtrans_order_id
        text midtrans_transaction_id
        uuid marked_paid_by FK
        timestamptz created_at
    }
```

## Tables

### tenants

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| name | text | not null | Nama toko/kantin |
| whatsapp_number | text | not null | Kontak follow-up manual platform, diisi wajib saat registrasi |
| created_at | timestamptz | not null, default now() | |

### profiles

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK, FK → auth.users.id | 1:1 dengan user Supabase Auth |
| tenant_id | uuid | FK → tenants.id, nullable | null untuk role `super_admin` |
| role | text | not null, check in (super_admin, admin, kasir) | |
| full_name | text | not null | |
| email_verification_token | text | nullable, unique | Token acak untuk tautan verifikasi email, dihapus/null-kan setelah dipakai |
| email_verification_sent_at | timestamptz | nullable | Untuk throttle kirim ulang email verifikasi |
| email_verified_at | timestamptz | nullable | null = belum verifikasi; akun admin tidak dapat login penuh sebelum terisi |
| created_at | timestamptz | not null, default now() | |

### products

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| tenant_id | uuid | FK → tenants.id, not null | RLS key |
| name | text | not null | |
| barcode | text | unique per tenant | dicari saat scan |
| category | text | nullable | |
| cost_price | numeric | not null, default 0 | harga modal |
| sell_price | numeric | not null | harga jual |
| track_stock | boolean | not null, default true | opsi jual tanpa lacak stok |
| stock_qty | numeric | not null, default 0 | diabaikan jika track_stock = false |
| low_stock_threshold | numeric | nullable | pemicu insight low stock |
| is_consignment | boolean | not null, default false | |
| created_at / updated_at | timestamptz | not null, default now() | |

### consignors

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| tenant_id | uuid | FK → tenants.id, not null | |
| name | text | not null | |
| phone | text | nullable | |
| created_at | timestamptz | not null, default now() | |

### consignment_batches

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| tenant_id | uuid | FK → tenants.id, not null | |
| product_id | uuid | FK → products.id, not null | |
| consignor_id | uuid | FK → consignors.id, not null | |
| qty_received | numeric | not null | jumlah barang dititip (batch harian) |
| qty_sold | numeric | not null, default 0 | |
| qty_returned | numeric | not null, default 0 | sisa yang dikembalikan ke penitip |
| fee_percent | numeric | not null, default 10 | persen fee, override per batch |
| date_received | date | not null | |
| status | text | not null, check in (active, settled, returned) | |

### transactions

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| tenant_id | uuid | FK → tenants.id, not null | |
| cashier_id | uuid | FK → profiles.id, not null | |
| local_id | text | unique per tenant | UUID digenerate client, untuk idempotency sync offline |
| total_amount | numeric | not null | |
| payment_method | text | not null, check in (cash, qris, transfer) | |
| cash_received | numeric | nullable | hanya untuk cash |
| change_amount | numeric | nullable | hanya untuk cash |
| sync_status | text | not null, default 'synced' | synced / pending, untuk audit trail sinkronisasi |
| created_at | timestamptz | not null | timestamp transaksi dibuat di client (bukan waktu sync) |

### transaction_items

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| transaction_id | uuid | FK → transactions.id, not null | |
| product_id | uuid | FK → products.id, nullable, `on delete set null` | null jika barang aslinya sudah dihapus; riwayat transaksi tetap ada |
| consignment_batch_id | uuid | FK → consignment_batches.id, nullable, `on delete set null` | terisi jika item barang titipan |
| qty | numeric | not null | |
| unit_price | numeric | not null | harga jual saat transaksi (snapshot) |
| cost_price_snapshot | numeric | not null | untuk hitung laba meski harga modal berubah nanti |
| fee_percent_snapshot | numeric | nullable | untuk hitung bagian penitip |
| subtotal | numeric | not null | |

### settlements

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| tenant_id | uuid | FK → tenants.id, not null | |
| consignor_id | uuid | FK → consignors.id, not null | |
| period_start / period_end | date | not null | |
| total_sales | numeric | not null | |
| total_fee | numeric | not null | bagian toko |
| total_payout | numeric | not null | bagian penitip |
| status | text | not null, check in (draft, paid) | draft = preview, belum final |
| created_at | timestamptz | not null, default now() | |

### subscriptions

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| tenant_id | uuid | FK → tenants.id, not null, unique | 1 tenant = 1 baris subscription |
| fee_percent | numeric | not null, default 2 | Override per tenant hasil negosiasi Super Admin; default 2% dari pendapatan bersih |
| trial_end | date | not null | `created_at` tenant + 1 bulan, dihitung sekali saat registrasi |
| status | text | not null, check in (trial, active, grace, suspended), default 'trial' | `active` = tagihan lunas/berjalan, `grace` = lewat jatuh tempo tapi masih masa tenggang, `suspended` = akses POS dibatasi |
| created_at | timestamptz | not null, default now() | |

### invoices

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| tenant_id | uuid | FK → tenants.id, not null | |
| period_start / period_end | date | not null | Periode tagihan bulanan |
| net_revenue | numeric | not null | Snapshot hasil agregasi margin non-konsinyasi (`transaction_items`) + `total_fee` (`settlements`) pada periode ini |
| fee_percent_snapshot | numeric | not null | Salinan `subscriptions.fee_percent` saat invoice dibuat, agar perubahan fee di masa depan tidak mengubah tagihan lama |
| amount_due | numeric | not null | `net_revenue * fee_percent_snapshot / 100` |
| due_date | date | not null | `period_end` + N hari (dikonfigurasi) |
| grace_end | date | not null | `due_date` + masa tenggang |
| status | text | not null, check in (draft, unpaid, paid, overdue, manual_paid), default 'draft' | `manual_paid` = ditandai lunas manual oleh Super Admin di luar Midtrans |
| paid_at | timestamptz | nullable | |
| midtrans_order_id | text | nullable, unique | Dikirim ke Midtrans saat create transaction |
| midtrans_transaction_id | text | nullable | Diisi dari payload webhook |
| marked_paid_by | uuid | FK → profiles.id, nullable | Diisi jika status `manual_paid` |
| created_at | timestamptz | not null, default now() | |

## Migration log

<!-- Append-only. Setiap perubahan skema dicatat, ditautkan ke fitur/phase penyebabnya. -->
| Date | Change | Reason / feature | Phase |
|---|---|---|---|
| 2026-07-16 | Skema awal: tenants, profiles, products, consignors, consignment_batches, transactions, transaction_items, settlements | init | 1 |
| 2026-07-17 | `transaction_items.product_id` & `consignment_batch_id`: ubah FK jadi `on delete set null` (kolom jadi nullable) agar riwayat transaksi tetap tersimpan saat barang/batch titipan dihapus, dan cascade delete tenant tidak lagi gagal karena urutan FK (BL-1) | BL-1 | 7 |
| 2026-07-23 | Tambah `tenants.whatsapp_number`; tambah `profiles.email_verification_token`/`email_verification_sent_at`/`email_verified_at`; tabel baru `subscriptions` & `invoices` untuk billing berbasis persentase pendapatan bersih | Billing & Subscription | 8 |
