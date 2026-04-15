"use strict";

/** 3 кунлик пробный период (Stripe trial + Supabase `subscriptions` / `user_quotas`). */
const TRIAL_DAYS = 3;

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {{
 *   stripe: import("stripe").default;
 *   supabase: import("@supabase/supabase-js").SupabaseClient;
 *   monthlyPriceId: string;
 *   userId: string;
 *   userEmail: string;
 * }} ctx
 */
async function handleStripeTrial(req, res, ctx) {
  const { stripe, supabase, monthlyPriceId, userId, userEmail } = ctx;

  if (!userId || !userEmail) {
    return res.status(400).json({ error: "Missing user context." });
  }

  try {
    const { data: existingSub, error: subReadErr } = await supabase
      .from("subscriptions")
      .select("status, trial_end")
      .eq("user_id", userId)
      .maybeSingle();

    if (subReadErr) {
      throw subReadErr;
    }

    if (existingSub?.status === "trial" && existingSub.trial_end) {
      const trialEnd = new Date(existingSub.trial_end);
      const daysLeft = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      if (daysLeft > 0) {
        return res.status(200).json({
          success: true,
          isTrial: true,
          trialDaysLeft: daysLeft,
          message: `You have ${daysLeft} days left in your trial`,
        });
      }
    }

    if (existingSub?.status === "active") {
      return res.status(200).json({
        success: true,
        isTrial: false,
        alreadySubscribed: true,
        message: "You already have an active subscription.",
      });
    }

    let customer;
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: { supabase_user_id: userId },
      });
    }

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: monthlyPriceId }],
      trial_period_days: TRIAL_DAYS,
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
        payment_method_types: ["card"],
      },
      metadata: {
        supabase_user_id: userId,
        is_trial: "true",
      },
      expand: ["latest_invoice.payment_intent"],
    });

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DAYS);

    const { error: upsertSubErr } = await supabase.from("subscriptions").upsert(
      {
        user_id: userId,
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        status: "trial",
        plan_type: "monthly",
        trial_start: new Date().toISOString(),
        trial_end: trialEndDate.toISOString(),
        current_period_start: new Date().toISOString(),
        current_period_end: trialEndDate.toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (upsertSubErr) {
      throw upsertSubErr;
    }

    const { error: upsertQuotaErr } = await supabase.from("user_quotas").upsert(
      {
        user_id: userId,
        is_premium: true,
        is_trial: true,
        trial_days_left: TRIAL_DAYS,
        ai_generations_limit: -1,
        tryon_limit: -1,
        saved_outfits_limit: -1,
      },
      { onConflict: "user_id" }
    );

    if (upsertQuotaErr) {
      throw upsertQuotaErr;
    }

    const inv = subscription.latest_invoice;
    const pi =
      inv && typeof inv === "object" && "payment_intent" in inv ? inv.payment_intent : null;
    const clientSecret =
      pi && typeof pi === "object" && pi !== null && "client_secret" in pi
        ? pi.client_secret
        : null;

    return res.status(200).json({
      success: true,
      isTrial: true,
      trialDaysLeft: TRIAL_DAYS,
      subscriptionId: subscription.id,
      clientSecret,
    });
  } catch (err) {
    console.error("Stripe trial error:", err);
    return res.status(500).json({ error: err.message || "Stripe trial failed." });
  }
}

module.exports = { handleStripeTrial, TRIAL_DAYS };
