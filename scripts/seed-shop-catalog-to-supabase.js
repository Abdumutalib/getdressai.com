require("dotenv").config();

const { createShopStore } = require("../lib/shop-store");
const { isSupabaseHttpUrl } = require("../lib/runtime-config");
const shopProducts = require("../data/shop-catalog");

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tableName = process.env.SUPABASE_SHOP_TABLE || "app_shop_products";

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  if (!isSupabaseHttpUrl(supabaseUrl)) {
    throw new Error(
      "SUPABASE_URL must be the HTTPS project URL, for example https://your-project.supabase.co, not a Postgres connection string."
    );
  }

  const shopStore = createShopStore({
    fallbackProducts: shopProducts,
    supabaseUrl,
    supabaseServiceRoleKey,
    tableName,
  });

  const result = await shopStore.seedFallbackProducts();
  console.log(`Seeded ${result.imported} catalog products to ${tableName}.`);
}

main().catch((error) => {
  if (error?.code === "PGRST205") {
    console.error(`Supabase table \"public.${process.env.SUPABASE_SHOP_TABLE || "app_shop_products"}\" was not found.`);
    console.error("Apply supabase/schema.sql to your Supabase project before running npm run supabase:seed-shop.");
  }
  console.error(error);
  process.exitCode = 1;
});