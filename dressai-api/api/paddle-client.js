/**
 * Server-side Paddle Billing client (API key). Frontend uses client-side token separately.
 * @see https://developer.paddle.com/api-reference/overview
 */
const { Paddle, Environment } = require("@paddle/paddle-node-sdk");

let cached;

function paddleEnvironment() {
  const raw = String(process.env.PADDLE_ENVIRONMENT || "sandbox").toLowerCase();
  return raw === "production" ? Environment.production : Environment.sandbox;
}

/** Returns a singleton Paddle client, or null if PADDLE_API_KEY is unset. */
function getPaddle() {
  const key = process.env.PADDLE_API_KEY?.trim();
  if (!key) return null;
  if (!cached) {
    cached = new Paddle(key, { environment: paddleEnvironment() });
  }
  return cached;
}

module.exports = { getPaddle, paddleEnvironment };
