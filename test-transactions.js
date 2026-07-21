require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const periodStart = "2026-07-21";
  const periodEnd = "2026-07-21";
  const { data } = await supabase
    .from("transactions")
    .select("id, created_at")
    .gte("created_at", `${periodStart}T00:00:00.000Z`)
    .lte("created_at", `${periodEnd}T23:59:59.999Z`);
  console.log("Filtered:", data?.length);

  const { data: all } = await supabase.from("transactions").select("id, created_at");
  console.log("All transactions:", all?.length);
  if (all?.length > 0) {
    console.log("First few created_at:", all.slice(0, 5).map(t => t.created_at));
  }
}
run();
