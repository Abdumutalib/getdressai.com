"use strict";

const { EventName } = require("@paddle/paddle-node-sdk");

/**
 * @param {Record<string, unknown> | null | undefined} customData
 * @returns {string | null}
 */
function extractUserIdFromCustomData(customData) {
  if (!customData || typeof customData !== "object") {
    return null;
  }
  const v =
    customData.supabase_user_id ??
    customData.user_id ??
    customData.userId ??
    null;
  const s = String(v ?? "").trim();
  return s || null;
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {string} userId
 * @param {{ id: string; customerId?: string | null }} tx
 */
async function applyPaddleTransactionToSupabase(supabase, userId, tx) {
  const transactionId = tx.id;
  const customerId = tx.customerId != null ? String(tx.customerId) : null;

  const { data: existing, error: readErr } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (readErr) {
    throw readErr;
  }

  if (existing?.paddle_last_transaction_id === transactionId) {
    return;
  }

  const now = new Date().toISOString();
  /** @type {Record<string, unknown>} */
  const subRow = {
    user_id: userId,
    paddle_customer_id: customerId || existing?.paddle_customer_id || null,
    paddle_last_transaction_id: transactionId,
    updated_at: now,
  };

  if (existing) {
    subRow.stripe_customer_id = existing.stripe_customer_id;
    subRow.stripe_subscription_id = existing.stripe_subscription_id;
    subRow.trial_start = existing.trial_start;
    subRow.trial_end = existing.trial_end;
    subRow.plan_type = existing.plan_type;
    subRow.current_period_start = existing.current_period_start;
    subRow.current_period_end = existing.current_period_end;
    subRow.cancel_at_period_end = existing.cancel_at_period_end;
    subRow.status = existing.status;
    subRow.paddle_subscription_id = existing.paddle_subscription_id ?? null;
  } else {
    subRow.stripe_customer_id = null;
    subRow.stripe_subscription_id = null;
    subRow.trial_start = null;
    subRow.trial_end = null;
    subRow.plan_type = "paddle";
    subRow.current_period_start = now;
    subRow.current_period_end = null;
    subRow.cancel_at_period_end = false;
    subRow.status = "active";
    subRow.paddle_subscription_id = null;
  }

  const { error: subErr } = await supabase.from("subscriptions").upsert(subRow, {
    onConflict: "user_id",
  });
  if (subErr) {
    throw subErr;
  }

  const { data: quota, error: qReadErr } = await supabase
    .from("user_quotas")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (qReadErr) {
    throw qReadErr;
  }

  /** @type {Record<string, unknown>} */
  const quotaRow = {
    user_id: userId,
    is_premium: true,
    is_trial: quota?.is_trial ?? false,
    trial_days_left: quota?.trial_days_left ?? 0,
    ai_generations_limit: -1,
    tryon_limit: -1,
    saved_outfits_limit: -1,
    updated_at: now,
  };

  if (quota) {
    quotaRow.ai_generations_used = quota.ai_generations_used;
    quotaRow.tryon_used = quota.tryon_used;
    quotaRow.last_reset_date = quota.last_reset_date;
  }

  const { error: qErr } = await supabase.from("user_quotas").upsert(quotaRow, {
    onConflict: "user_id",
  });
  if (qErr) {
    throw qErr;
  }
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {string} userId
 * @param {{ id: string; customerId: string; customData?: Record<string, unknown> | null }} sub
 */
async function applyPaddleSubscriptionActivated(supabase, userId, sub) {
  const now = new Date().toISOString();
  const { data: existing, error: readErr } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (readErr) {
    throw readErr;
  }

  /** @type {Record<string, unknown>} */
  const subRow = {
    user_id: userId,
    paddle_customer_id: sub.customerId,
    paddle_subscription_id: sub.id,
    updated_at: now,
  };

  if (existing) {
    subRow.stripe_customer_id = existing.stripe_customer_id;
    subRow.stripe_subscription_id = existing.stripe_subscription_id;
    subRow.trial_start = existing.trial_start;
    subRow.trial_end = existing.trial_end;
    subRow.plan_type = existing.plan_type || "paddle";
    subRow.current_period_start = existing.current_period_start;
    subRow.current_period_end = existing.current_period_end;
    subRow.cancel_at_period_end = existing.cancel_at_period_end;
    subRow.paddle_last_transaction_id = existing.paddle_last_transaction_id ?? null;
    subRow.status = existing.status === "trial" ? "trial" : "active";
  } else {
    subRow.stripe_customer_id = null;
    subRow.stripe_subscription_id = null;
    subRow.trial_start = null;
    subRow.trial_end = null;
    subRow.plan_type = "paddle";
    subRow.current_period_start = now;
    subRow.current_period_end = null;
    subRow.cancel_at_period_end = false;
    subRow.paddle_last_transaction_id = null;
    subRow.status = "active";
  }

  const { error: subErr } = await supabase.from("subscriptions").upsert(subRow, {
    onConflict: "user_id",
  });
  if (subErr) {
    throw subErr;
  }

  const { data: quota, error: qReadErr } = await supabase
    .from("user_quotas")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (qReadErr) {
    throw qReadErr;
  }

  /** @type {Record<string, unknown>} */
  const quotaRow = {
    user_id: userId,
    is_premium: true,
    is_trial: quota?.is_trial ?? false,
    trial_days_left: quota?.trial_days_left ?? 0,
    ai_generations_limit: -1,
    tryon_limit: -1,
    saved_outfits_limit: -1,
    updated_at: now,
  };

  if (quota) {
    quotaRow.ai_generations_used = quota.ai_generations_used;
    quotaRow.tryon_used = quota.tryon_used;
    quotaRow.last_reset_date = quota.last_reset_date;
  }

  const { error: qErr } = await supabase.from("user_quotas").upsert(quotaRow, {
    onConflict: "user_id",
  });
  if (qErr) {
    throw qErr;
  }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {{
 *   paddle: import("@paddle/paddle-node-sdk").Paddle | null;
 *   supabaseAdmin: import("@supabase/supabase-js").SupabaseClient | null;
 * }} ctx
 */
async function handlePaddleWebhook(req, res, ctx) {
  const { paddle, supabaseAdmin } = ctx;
  const secret = process.env.PADDLE_WEBHOOK_SECRET?.trim();

  if (!paddle || !secret) {
    return res.status(503).json({
      error: "Paddle webhook is not configured.",
      details: "Set PADDLE_API_KEY and PADDLE_WEBHOOK_SECRET.",
    });
  }

  const signature = req.headers["paddle-signature"];
  if (typeof signature !== "string" || !signature.trim()) {
    return res.status(400).json({ error: "Missing paddle-signature header." });
  }

  const raw =
    Buffer.isBuffer(req.body) ? req.body.toString("utf8") : String(req.body ?? "");

  if (!raw) {
    return res.status(400).json({ error: "Empty body." });
  }

  let event;
  try {
    event = await paddle.webhooks.unmarshal(raw, secret, signature);
  } catch (err) {
    return res.status(400).json({
      error: "Invalid Paddle webhook signature.",
      details: err.message,
    });
  }

  try {
    const t = event.eventType;

    if (t === EventName.TransactionCompleted || t === EventName.TransactionPaid) {
      const data = event.data;
      const userId = extractUserIdFromCustomData(data.customData);
      if (!userId) {
        return res.status(200).json({
          received: true,
          ignored: "no supabase_user_id in transaction custom_data",
        });
      }
      if (!supabaseAdmin) {
        return res.status(503).json({ error: "Supabase is not configured for webhooks." });
      }
      await applyPaddleTransactionToSupabase(supabaseAdmin, userId, data);
      return res.json({ received: true });
    }

    if (t === EventName.SubscriptionActivated) {
      const data = event.data;
      const userId = extractUserIdFromCustomData(data.customData);
      if (!userId) {
        return res.status(200).json({
          received: true,
          ignored: "no supabase_user_id in subscription custom_data",
        });
      }
      if (!supabaseAdmin) {
        return res.status(503).json({ error: "Supabase is not configured for webhooks." });
      }
      await applyPaddleSubscriptionActivated(supabaseAdmin, userId, data);
      return res.json({ received: true });
    }

    if (t === EventName.SubscriptionCanceled) {
      const data = event.data;
      const userId = extractUserIdFromCustomData(data.customData);
      if (userId && supabaseAdmin) {
        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({ status: "cancelled", updated_at: new Date().toISOString() })
          .eq("user_id", userId)
          .eq("paddle_subscription_id", data.id);
        if (error) {
          console.warn("Paddle subscription.canceled update:", error.message);
        }
      }
      return res.json({ received: true });
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("Paddle webhook handling failed:", err);
    return res.status(500).json({
      error: "Failed to process Paddle webhook.",
      details: err.message,
    });
  }
}

module.exports = { handlePaddleWebhook, extractUserIdFromCustomData };
