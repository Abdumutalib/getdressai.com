"use strict";

/**
 * Фойдаланувчи квоталари (`user_quotas`). JWT билан тасдиқланган user_id ишлатилади.
 * Алдинги қадам: Supabase RPC `reset_daily_quotas` ва `check_expired_trials` (schema.sql).
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {{
 *   supabase: import("@supabase/supabase-js").SupabaseClient;
 *   userId: string;
 * }} ctx
 */
async function handleUserQuota(req, res, ctx) {
  const { supabase, userId } = ctx;

  if (!userId) {
    return res.status(400).json({ error: "Missing user context." });
  }

  try {
    try {
      await supabase.rpc("reset_daily_quotas");
    } catch (e) {
      console.warn("user-quota: reset_daily_quotas", e.message);
    }
    try {
      await supabase.rpc("check_expired_trials");
    } catch (e) {
      console.warn("user-quota: check_expired_trials", e.message);
    }

    const { data: quota, error } = await supabase
      .from("user_quotas")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      is_premium: quota?.is_premium ?? false,
      is_trial: quota?.is_trial ?? false,
      trial_days_left: quota?.trial_days_left ?? 0,
      ai_generations_used: quota?.ai_generations_used ?? 0,
      ai_generations_limit: quota?.ai_generations_limit ?? 5,
      tryon_used: quota?.tryon_used ?? 0,
      tryon_limit: quota?.tryon_limit ?? 3,
      saved_outfits_limit: quota?.saved_outfits_limit ?? 10,
      last_reset_date: quota?.last_reset_date ?? null,
    });
  } catch (err) {
    console.error("user-quota:", err);
    return res.status(500).json({ error: err.message || "Failed to load quotas." });
  }
}

module.exports = { handleUserQuota };
