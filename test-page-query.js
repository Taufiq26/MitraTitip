require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const periodStart = "2026-07-21";
  const periodEnd = "2026-07-21";
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      id,
      local_id,
      total_amount,
      payment_method,
      created_at,
      profiles ( name ),
      transaction_items (
        product_id,
        qty,
        subtotal,
        products ( name )
      )
    `)
    .gte("created_at", `${periodStart}T00:00:00.000Z`)
    .lte("created_at", `${periodEnd}T23:59:59.999Z`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Query Error:", error);
  } else {
    console.log("Returned:", data?.length, "transactions");
    if (data?.length > 0) {
      console.log("Sample:", JSON.stringify(data[0], null, 2));
    }
  }
}
run();
