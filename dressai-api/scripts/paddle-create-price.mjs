/**
 * One-off: create a Paddle catalog price for an existing product.
 *
 * Usage (from dressai-api):
 *   node scripts/paddle-create-price.mjs pro_xxxxxxxx [amountMinor] [currency]
 * Env: PADDLE_API_KEY, optional PADDLE_ENVIRONMENT=sandbox|production
 *
 * Example (USD $10.00 → minor units 1000):
 *   node scripts/paddle-create-price.mjs pro_xxx 1000 USD
 */
import { config } from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Paddle, Environment } from "@paddle/paddle-node-sdk";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", ".env") });

const apiKey = process.env.PADDLE_API_KEY?.trim();
const productId = (process.argv[2] || process.env.PADDLE_PRODUCT_ID || "").trim();
const amountMinor = (process.argv[3] || "1000").trim();
const currencyCode = (process.argv[4] || "USD").trim().toUpperCase();

if (!apiKey) {
  console.error("Missing PADDLE_API_KEY in .env");
  process.exit(1);
}
if (!productId) {
  console.error(
    "Usage: node scripts/paddle-create-price.mjs <productId> [amountMinor] [currency]\n" +
      "Example: node scripts/paddle-create-price.mjs pro_xxx 1000 USD"
  );
  process.exit(1);
}

const env =
  String(process.env.PADDLE_ENVIRONMENT || "sandbox").toLowerCase() === "production"
    ? Environment.production
    : Environment.sandbox;

const paddle = new Paddle(apiKey, { environment: env });

const price = await paddle.prices.create({
  productId,
  description: `Catalog price ${currencyCode} amount ${amountMinor} (minor units)`,
  unitPrice: { amount: amountMinor, currencyCode },
});

console.log(JSON.stringify({ id: price.id, status: price.status, unitPrice: price.unitPrice }, null, 2));
