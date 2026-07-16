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
{ "tenant_name": "Kantin Melati", "admin_email": "admin@contoh.com", "admin_password": "********", "admin_name": "Ibu Sari" }
```

- **Response 200:**

```json
{ "success": true, "data": { "tenant_id": "uuid", "user_id": "uuid" }, "error": null }
```

- **Errors:** 422 validasi gagal (email sudah dipakai, password terlalu pendek), 500 gagal membuat tenant

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
