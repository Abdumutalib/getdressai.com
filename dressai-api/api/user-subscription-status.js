"use strict";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {{
 *   supabase: import("@supabase/supabase-js").SupabaseClient;
 *   userId: string;
 * }} ctx
 */
async function handleUserSubscriptionStatus(req, res, ctx) {
  const { supabase, userId } = ctx;

  if (!userId) {
    return res.status(400).json({ error: "Missing user context." });
  }

  try {
    const { data: sub, error: e1 } = await supabase
      .from("subscriptions")
      .select("status, paddle_subscription_id, trial_end, current_period_end, cancel_at_period_end")
      .eq("user_id", userId)
      .maybeSingle();

    if (e1) {
      throw e1;
    }

    const { data: quota, error: e2 } = await supabase
      .from("user_quotas")
      .select("is_premium, is_trial, trial_days_left")
      .eq("user_id", userId)
      .maybeSingle();

    if (e2) {
      throw e2;
    }

    let trialDaysLeft = Number(quota?.trial_days_left) || 0;
    if (sub?.status === "trial" && sub.trial_end) {
      const end = new Date(sub.trial_end).getTime();
      const d = Math.ceil((end - Date.now()) / 86400000);
      trialDaysLeft = Math.max(0, d);
    }

    const st = sub?.status || "none";
    const cancelled = st === "cancelled";

    const isTrialActive = !cancelled && st === "trial";
    const isPremiumActive =
      !cancelled &&
      quota?.is_premium === true &&
      (st === "active" || st === "trial");

    return res.status(200).json({
      is_trial: Boolean(isTrialActive),
      is_premium: Boolean(isPremiumActive),
      trial_days_left: trialDaysLeft,
      subscription_id: sub?.paddle_subscription_id ?? null,
      current_period_end: sub?.current_period_end ?? null,
      status: st,
      cancel_at_period_end: Boolean(sub?.cancel_at_period_end),
    });
  } catch (err) {
    console.error("user-subscription-status:", err);
    return res.status(500).json({ error: err.message || "Failed to load subscription status." });
  }
}

module.exports = { handleUserSubscriptionStatus };
