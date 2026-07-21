-- Modify compute_consignor_settlement to group by date_received
drop function if exists compute_consignor_settlement;

create or replace function compute_consignor_settlement(
  p_consignor_id uuid,
  p_period_start date,
  p_period_end date
)
returns table (
  date_received date,
  total_sales numeric, 
  total_fee numeric, 
  total_payout numeric
)
language sql
stable
security invoker
as $$
  select
    cb.date_received,
    coalesce(sum(ti.subtotal), 0) as total_sales,
    coalesce(sum(ti.subtotal * ti.fee_percent_snapshot / 100), 0) as total_fee,
    coalesce(sum(ti.subtotal * (1 - ti.fee_percent_snapshot / 100)), 0) as total_payout
  from transaction_items ti
  join transactions t on t.id = ti.transaction_id
  join consignment_batches cb on cb.id = ti.consignment_batch_id
  where cb.consignor_id = p_consignor_id
    and t.created_at::date between p_period_start and p_period_end
  group by cb.date_received;
$$;

-- Add date_received to settlements table so we can track which batch was settled
alter table settlements add column if not exists date_received date;
