-- MitraTitip: tambah qty_sold pada batch titipan saat barang terjual
-- Dipanggil dari POST /api/sync/push (src/app/api/sync/push/route.ts)
-- Referensi: docs/core/requirements.md (FR-10), docs/core/phases.md (task 4.7)

create or replace function increment_batch_qty_sold(p_batch_id uuid, p_qty numeric)
returns void
language plpgsql
security invoker
as $$
begin
  update consignment_batches
  set qty_sold = qty_sold + p_qty
  where id = p_batch_id;
end;
$$;
