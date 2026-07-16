-- MitraTitip: fungsi pengurangan stok otomatis
-- Dipanggil dari alur transaksi kasir (Phase 4) untuk setiap item yang track_stock = true.
-- Referensi: docs/core/requirements.md (FR-6), docs/core/phases.md (task 2.3)

create or replace function decrement_product_stock(p_product_id uuid, p_qty numeric)
returns void
language plpgsql
security invoker
as $$
begin
  update products
  set stock_qty = stock_qty - p_qty,
      updated_at = now()
  where id = p_product_id
    and track_stock = true;
end;
$$;
