-- MitraTitip: jaga riwayat transaksi tetap ada saat barang/batch titipan dihapus
-- Referensi: docs/core/backlog.md (BL-1), docs/core/database.md (migration log 2026-07-17)

alter table transaction_items
  alter column product_id drop not null;

alter table transaction_items
  drop constraint if exists transaction_items_product_id_fkey;

alter table transaction_items
  add constraint transaction_items_product_id_fkey
  foreign key (product_id) references products (id) on delete set null;

alter table transaction_items
  drop constraint if exists transaction_items_consignment_batch_id_fkey;

alter table transaction_items
  add constraint transaction_items_consignment_batch_id_fkey
  foreign key (consignment_batch_id) references consignment_batches (id) on delete set null;
