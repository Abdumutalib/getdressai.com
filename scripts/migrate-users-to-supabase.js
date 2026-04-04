require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const { isSupabaseHttpUrl } = require("../lib/runtime-config");

const usersFilePath = path.join(__dirname, "..", "data", "users.json");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const tableName = process.env.SUPABASE_USERS_TABLE || "app_users";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function readUsers() {
  if (!fs.existsSync(usersFilePath)) {
    return [];
  }

  const content = fs.readFileSync(usersFilePath, "utf8");
  const parsed = JSON.parse(content);
  return Array.isArray(parsed) ? parsed : [];
}

async function main() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  if (!isSupabaseHttpUrl(supabaseUrl)) {
    throw new Error(
      "SUPABASE_URL must be the HTTPS project URL, for example https://your-project.supabase.co, not a Postgres connection string."
    );
  }

  const users = readUsers();
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const rows = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: normalizeEmail(user.email),
    password_hash: user.passwordHash,
    plan: user.plan || "free",
    role: user.role || "user",
    image_generation_count: Number(user.imageGenerationCount) || 0,
    referral_source: user.referral_source || null,
    stripe_customer_email: user.stripeCustomerEmail || null,
    last_checkout_session_id: user.lastCheckoutSessionId || null,
    last_payment_status: user.lastPaymentStatus || null,
    created_at: user.createdAt || new Date().toISOString(),
    updated_at: user.updatedAt || new Date().toISOString(),
  }));

  if (rows.length === 0) {
    console.log("No users found in data/users.json.");
    return;
  }

  const { error } = await supabase.from(tableName).upsert(rows, { onConflict: "id" });

  if (error) {
    throw error;
  }

  console.log(`Migrated ${rows.length} users to ${tableName}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});