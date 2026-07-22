# API Contract

## Conventions

- Base URL: `/api`
- Auth: Bearer JWT dari Supabase Auth di header `Authorization`, divalidasi di server (Next.js API route) via Supabase server client; `tenant_id` diambil dari profile pengguna yang login, bukan dari body request
- Response envelope:

```json
{ "success": true, "data": {}, "error": null, "meta": {} }
```

<!-- CRUD standar (produk, penitip, dsb) memakai Supabase client langsung dari aplikasi dengan proteksi RLS. Endpoint di bawah ini khusus untuk logika yang tidak bisa/sebaiknya tidak dilakukan langsung dari client. -->

## Endpoints

### `POST /api/tenants/register`

- **Auth:** none (public, endpoint pendaftaran)
- **Request:**

```json
{ "tenant_name": "Kantin Melati", "admin_email": "admin@contoh.com", "admin_password": "********", "admin_name": "Ibu Sari", "whatsapp_number": "081234567890" }
```

- **Response 200:**

```json
{ "success": true, "data": { "tenant_id": "uuid", "user_id": "uuid" }, "error": null }
```

- **Errors:** 422 validasi gagal (email sudah dipakai, password terlalu pendek, `whatsapp_number` kosong), 500 gagal membuat tenant
- **Efek samping:** membuat baris `subscriptions` (status `trial`, `trial_end` = hari ini + 1 bulan), mengisi `email_verification_token` di profile admin, dan mengirim email verifikasi via Mailgun. Login penuh baru diizinkan setelah `email_verified_at` terisi.

### `GET /api/verify-email?token={token}`

- **Auth:** none (public, link dari email)
- **Response 200:**

```json
{ "success": true, "data": { "verified": true }, "error": null }
```

- **Errors:** 400 token tidak valid/sudah dipakai, 410 token kedaluwarsa (kirim ulang dari halaman login)

### `POST /api/verify-email/resend`

- **Auth:** none (public, dibatasi rate-limit per email)
- **Request:** `{ "email": "admin@contoh.com" }`
- **Response 200:** `{ "success": true, "data": { "sent": true }, "error": null }`
- **Errors:** 429 terlalu sering meminta kirim ulang, 404 email tidak ditemukan

### `POST /api/sync/push`

- **Auth:** Bearer JWT (Admin/Kasir)
- **Request:**

```json
{ "transactions": [ { "local_id": "uuid-client", "total_amount": 25000, "payment_method": "cash", "cash_received": 30000, "items": [ { "product_id": "uuid", "qty": 2, "unit_price": 12500 } ], "created_at": "2026-07-16T09:00:00Z" } ] }
```

- **Response 200:**

```json
{ "success": true, "data": { "synced": ["uuid-client"], "conflicts": [] }, "error": null }
```

- **Errors:** 409 konflik data (mis. stok sudah berubah di server), 422 payload tidak valid — `local_id` dipakai sebagai kunci idempotency agar transaksi yang sama tidak tersimpan dua kali saat retry

### `GET /api/sync/pull?since={timestamp}`

- **Auth:** Bearer JWT (Admin/Kasir)
- **Response 200:**

```json
{ "success": true, "data": { "products": [], "consignment_batches": [], "server_time": "2026-07-16T09:05:00Z" }, "error": null }
```

- **Errors:** 401 token invalid/expired

### `POST /api/consignment/settlements`

- **Auth:** Bearer JWT (Admin)
- **Request:**

```json
{ "consignor_id": "uuid", "period_start": "2026-07-01", "period_end": "2026-07-15" }
```

- **Response 200:**

```json
{ "success": true, "data": { "total_sales": 500000, "total_fee": 50000, "total_payout": 450000, "status": "draft" }, "error": null }
```

- **Errors:** 404 penitip tidak ditemukan — response ini adalah **preview**, belum tersimpan sebagai record final sampai endpoint finalize dipanggil

### `POST /api/consignment/settlements/:id/finalize`

- **Auth:** Bearer JWT (Admin)
- **Response 200:**

```json
{ "success": true, "data": { "id": "uuid", "status": "paid" }, "error": null }
```

- **Errors:** 404 settlement tidak ditemukan, 409 sudah difinalisasi sebelumnya

### `GET /api/admin/tenants`

- **Auth:** Bearer JWT (role `super_admin` saja)
- **Response 200:**

```json
{ "success": true, "data": [ { "id": "uuid", "name": "Kantin Melati", "created_at": "2026-07-16T08:00:00Z" } ], "error": null, "meta": { "total": 1 } }
```

- **Errors:** 403 bukan super_admin

### `PATCH /api/admin/tenants/:id/fee`

- **Auth:** Bearer JWT (role `super_admin` saja)
- **Request:** `{ "fee_percent": 1.5 }`
- **Response 200:** `{ "success": true, "data": { "tenant_id": "uuid", "fee_percent": 1.5 }, "error": null }`
- **Errors:** 403 bukan super_admin, 404 tenant/subscription tidak ditemukan, 422 nilai di luar rentang wajar (mis. negatif atau > 100)

### `PATCH /api/admin/invoices/:id/mark-paid`

- **Auth:** Bearer JWT (role `super_admin` saja)
- **Response 200:** `{ "success": true, "data": { "id": "uuid", "status": "manual_paid", "marked_paid_by": "uuid" }, "error": null }`
- **Errors:** 403 bukan super_admin, 404 invoice tidak ditemukan, 409 invoice sudah berstatus `paid`/`manual_paid`

### `GET /api/admin/billing`

- **Auth:** Bearer JWT (role `super_admin` saja)
- **Response 200:**

```json
{ "success": true, "data": [ { "tenant_id": "uuid", "tenant_name": "Kantin Melati", "period": "2026-07", "net_revenue": 5000000, "fee_percent": 2, "amount_due": 100000, "status": "unpaid", "due_date": "2026-08-05" } ], "error": null, "meta": { "total_outstanding": 100000 } }
```

- **Errors:** 403 bukan super_admin — laporan piutang platform di seluruh tenant, dapat difilter per periode lewat query param `?period=2026-07`

### `GET /api/tenant/billing`

- **Auth:** Bearer JWT (role `admin` tenant tersebut)
- **Response 200:**

```json
{ "success": true, "data": { "current": { "id": "uuid", "period": "2026-07", "amount_due": 100000, "due_date": "2026-08-05", "grace_end": "2026-08-10", "status": "unpaid" }, "history": [] }, "error": null }
```

- **Errors:** 401 token invalid — hanya menampilkan tagihan milik tenant sendiri (via `tenant_id` dari profile, bukan dari request)

### `POST /api/tenant/billing/:invoiceId/pay`

- **Auth:** Bearer JWT (role `admin` tenant tersebut)
- **Response 200:**

```json
{ "success": true, "data": { "snap_token": "xxx", "redirect_url": "https://app.midtrans.com/snap/v3/xxx" }, "error": null }
```

- **Errors:** 404 invoice tidak ditemukan/bukan milik tenant, 409 invoice sudah lunas — membuat Midtrans Snap transaction dari invoice, `midtrans_order_id` disimpan sebelum redirect

### `POST /api/billing/webhook/midtrans`

- **Auth:** none secara header, tapi payload diverifikasi via signature key Midtrans (bukan Bearer JWT)
- **Request:** payload notifikasi standar Midtrans (`order_id`, `transaction_status`, `signature_key`, dst.)
- **Response 200:** `{ "success": true, "data": { "processed": true }, "error": null }`
- **Errors:** 400 signature tidak valid (request ditolak, tidak memproses status) — idempotent berdasarkan `order_id`; transaction_status `settlement`/`capture` menandai invoice `paid` dan mengembalikan `subscriptions.status` tenant ke `active`
