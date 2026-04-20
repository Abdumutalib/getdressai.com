import crypto from "node:crypto";
import { z } from "zod";

const paddleEnvironment = process.env.PADDLE_ENVIRONMENT || "sandbox";
const paddleApiKey = process.env.PADDLE_API_KEY || "";
const paddleWebhookSecret = process.env.PADDLE_WEBHOOK_SECRET || "";
const yearlyPreferred = String(process.env.BILLING_YEARLY_PREFERRED ?? "true").toLowerCase() !== "false";
const paddlePriceIds = {
  starter: {
    yearly: process.env.PADDLE_PRICE_STARTER_YEARLY || process.env.PADDLE_PRICE_STARTER_ANNUAL || process.env.PADDLE_PRICE_STARTER || "",
    monthly: process.env.PADDLE_PRICE_STARTER_MONTHLY || process.env.PADDLE_PRICE_STARTER || ""
  },
  popular: {
    yearly: process.env.PADDLE_PRICE_POPULAR_YEARLY || process.env.PADDLE_PRICE_POPULAR_ANNUAL || process.env.PADDLE_PRICE_POPULAR || "",
    monthly: process.env.PADDLE_PRICE_POPULAR_MONTHLY || process.env.PADDLE_PRICE_POPULAR || ""
  },
  pro: {
    yearly: process.env.PADDLE_PRICE_PRO_YEARLY || process.env.PADDLE_PRICE_PRO_ANNUAL || process.env.PADDLE_PRICE_PRO || "",
    monthly: process.env.PADDLE_PRICE_PRO_MONTHLY || process.env.PADDLE_PRICE_PRO || ""
  }
};

export const billingCycleSchema = z.enum(["yearly", "monthly"]);

export const checkoutSchema = z.object({
  plan: z.enum(["starter", "popular", "pro", "credits"]),
  billingCycle: billingCycleSchema.optional().default(yearlyPreferred ? "yearly" : "monthly"),
  email: z.string().email(),
  userId: z.string().min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url()
});

export async function createPaddleCheckout(input: z.infer<typeof checkoutSchema>) {
  const payload = checkoutSchema.parse(input);

  if (!paddleApiKey) {
    throw new Error("Missing Paddle API key.");
  }

  const priceId =
    payload.plan === "credits"
      ? process.env.PADDLE_PRICE_CREDIT_PACK || ""
      : paddlePriceIds[payload.plan][payload.billingCycle] || paddlePriceIds[payload.plan].yearly || paddlePriceIds[payload.plan].monthly;

  if (!priceId) {
    throw new Error(`Missing Paddle price for plan: ${payload.plan} (${payload.billingCycle}).`);
  }

  const response = await fetch("https://api.paddle.com/transactions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paddleApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      items: [{ price_id: priceId, quantity: 1 }],
      customer: {
        email: payload.email
      },
      custom_data: {
        userId: payload.userId,
        plan: payload.plan,
        billingCycle: payload.billingCycle
      },
      checkout: {
        url: payload.successUrl,
        settings: {
          display_mode: "overlay",
          locale: "en"
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error("Failed to create Paddle checkout.");
  }

  return response.json();
}

export function verifyPaddleWebhook(rawBody: string, signature: string) {
  if (!paddleWebhookSecret) {
    throw new Error("Missing Paddle webhook secret.");
  }

  const expected = crypto
    .createHmac("sha256", paddleWebhookSecret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function getPaddleClientConfig() {
  return {
    environment: paddleEnvironment,
    clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || ""
  };
}
