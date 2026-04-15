"use strict";

/**
 * Пробный период / обунани бекор қилиш (Stripe `cancel_at_period_end` + Supabase).
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {{
 *   stripe: import("stripe").default;
 *   supabase: import("@supabase/supabase-js").SupabaseClient;
 *   userId: string;
 * }} ctx
 */
async function handleCancelTrial(req, res, ctx) {
  const { stripe, supabase, userId } = ctx;

  if (!userId) {
    return res.status(400).json({ error: "Missing user context." });
  }

  const bodySubId =
    typeof req.body?.subscription_id === "string" ? req.body.subscription_id.trim() : "";

  try {
    const { data: row, error: readErr } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id, status")
      .eq("user_id", userId)
      .maybeSingle();

    if (readErr) {
      throw readErr;
    }

    if (!row?.stripe_subscription_id) {
      return res.status(404).json({
        error: "No subscription found for this user.",
      });
    }

    const subscriptionId = bodySubId || row.stripe_subscription_id;

    if (bodySubId && bodySubId !== row.stripe_subscription_id) {
      return res.status(403).json({
        error: "Subscription does not belong to the current user.",
      });
    }

    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    const nowIso = new Date().toISOString();

    const { error: subUpErr } = await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancel_at_period_end: true,
        updated_at: nowIso,
      })
      .eq("user_id", userId);

    if (subUpErr) {
      throw subUpErr;
    }

    const { error: quotaErr } = await supabase
      .from("user_quotas")
      .update({
        is_premium: false,
        is_trial: false,
        trial_days_left: 0,
        ai_generations_limit: 5,
        tryon_limit: 3,
        saved_outfits_limit: 10,
        updated_at: nowIso,
      })
      .eq("user_id", userId);

    if (quotaErr) {
      throw quotaErr;
    }

    return res.status(200).json({
      success: true,
      message: "Trial cancelled. You will be downgraded to free plan.",
    });
  } catch (err) {
    console.error("Cancel trial error:", err);
    return res.status(500).json({ error: err.message || "Cancel trial failed." });
  }
}

module.exports = { handleCancelTrial };
