/**
 * GetdressAI — single-page app (no React/Vue).
 *
 * Stack: Supabase Auth + Postgres (profiles, products, outfits, orders),
 *        OpenRouter, Groq, OpenAI, or local Ollama via same-origin POST /api/outfit.
 *
 * Server: cloud keys, or AI_PROVIDER=ollama + Ollama on OLLAMA_BASE_URL (local dev).
 * Client: aiModel in index.html (e.g. gpt-4o-mini, mistralai/mixtral-8x7b, llama3).
 *
 * Sections: validateConfig → auth → profile → AI generate/save → shop → cart → orders
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  t,
  getAmazonHost,
  fillLocaleSelects,
  fillRegionSelects,
  applyI18n,
  refreshRegionOptions,
  setLocale,
  setRegion,
  getLocale,
  languageInstructionForAI,
  regionHintForAI,
} from "./i18n.js";

// ---------------------------------------------------------------------------
// Config (injected from index.html — see HTML comment block)
// ---------------------------------------------------------------------------
const CFG = window.GETDRESSAI_CONFIG || {};
const SUPABASE_URL = (CFG.supabaseUrl || "").trim();
const SUPABASE_ANON_KEY = (CFG.supabaseAnonKey || "").trim();
/** Same-origin proxy → OpenRouter or Groq (see api/outfit.js). */
const AI_PROXY_URL = (CFG.openaiProxyUrl || CFG.aiProxyUrl || "").trim();
/** OpenRouter model id (e.g. mistralai/mixtral-8x7b) or Groq model (e.g. llama-3.1-8b-instant). */
const CHAT_MODEL =
  (CFG.aiModel || CFG.openaiModel || "mistralai/mixtral-8x7b").trim() ||
  "mistralai/mixtral-8x7b";
/** Amazon Associates store tag → &tag=… in search links (empty = hide link). */
const AMAZON_AFFILIATE_TAG = (CFG.amazonAffiliateTag || "").trim();

function amazonAssociateSearchUrl(query, associateTag) {
  const q = String(query || "").trim();
  const tag = String(associateTag || "").trim();
  if (!q || !tag) return "";
  const host = getAmazonHost();
  return `https://${host}/s?k=${encodeURIComponent(q)}&tag=${encodeURIComponent(tag)}`;
}

/** @type {ReturnType<typeof createClient> | null} */
let supabase = null;

  // ---------------------------------------------------------------------------
  // DOM refs (set on DOMContentLoaded)
  // ---------------------------------------------------------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  let els = {};

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  let currentUser = null;
  let userProfile = null;
  let products = [];
  let savedOutfits = [];
  let cart = [];
  /** @type {string} */
  let currentViewName = "generate";

  // ---------------------------------------------------------------------------
  // Toasts
  // ---------------------------------------------------------------------------
  function toast(message, type = "info") {
    const host = els.toastHost;
    if (!host) return;
    const el = document.createElement("div");
    const bg =
      type === "error"
        ? "bg-neutral-900 text-white"
        : type === "success"
          ? "bg-neutral-800 text-white"
          : "bg-white text-neutral-900 border border-neutral-200";
    el.className = `toast pointer-events-auto max-w-sm rounded-2xl px-4 py-3 text-sm shadow-lg ${bg}`;
    el.textContent = message;
    host.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transition = "opacity 0.3s ease";
      setTimeout(() => el.remove(), 320);
    }, 4200);
  }

  function showFatal(msg) {
    const b = $("#fatal-banner");
    if (b) {
      b.classList.remove("hidden");
      b.textContent = msg;
    }
    toast(msg, "error");
  }

  // ---------------------------------------------------------------------------
  // Config validation
  // ---------------------------------------------------------------------------
  function isValidSupabaseHttpUrl(url) {
    try {
      const u = new URL(url);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch {
      return false;
    }
  }

  function validateConfig() {
    const missing = [];
    const urlBad =
      !SUPABASE_URL ||
      /PASTE_YOUR/i.test(SUPABASE_URL) ||
      /placeholder/i.test(SUPABASE_URL);
    const keyBad =
      !SUPABASE_ANON_KEY ||
      /PASTE_YOUR/i.test(SUPABASE_ANON_KEY) ||
      /placeholder/i.test(SUPABASE_ANON_KEY);

    if (urlBad) {
      missing.push(
        "Supabase URL (https://xxxx.supabase.co — Dashboard → Settings → API)",
      );
    } else if (!isValidSupabaseHttpUrl(SUPABASE_URL)) {
      showFatal(
        "Invalid Supabase URL: must start with https:// (copy Project URL from Supabase → Settings → API). / Недопустимый supabaseUrl.",
      );
      return false;
    }

    if (keyBad) {
      missing.push("Supabase anon (public) key");
    }

    if (!AI_PROXY_URL) {
      missing.push("openaiProxyUrl (e.g. /api/outfit — AI proxy on same origin)");
    }
    if (missing.length) {
      showFatal(
        `Missing: ${missing.join(", ")}. Add SUPABASE_URL + SUPABASE_ANON_KEY to getdressai/.env and run npm run dev, or edit GETDRESSAI_CONFIG in index.html (SETUP.md).`,
      );
      return false;
    }
    try {
      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (e) {
      showFatal("Supabase client failed: " + (e.message || String(e)));
      return false;
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------
  function setView(name) {
    currentViewName = name;
    $$("[data-view]").forEach((v) => {
      const on = v.getAttribute("data-view") === name;
      v.classList.toggle("hidden", !on);
      if (on) {
        v.classList.remove("view-enter");
        void v.offsetWidth;
        v.classList.add("view-enter");
      }
    });
    $$("[data-nav]").forEach((btn) => {
      btn.setAttribute(
        "aria-current",
        btn.getAttribute("data-nav") === name ? "page" : "false"
      );
      const active = btn.getAttribute("data-nav") === name;
      btn.classList.toggle("bg-neutral-900", active);
      btn.classList.toggle("text-white", active);
      btn.classList.toggle("text-neutral-600", !active);
    });
    if (name === "shop") loadProducts();
    if (name === "saved") loadOutfits();
    if (name === "orders") loadOrders();
    if (name === "cart") renderCart();
    if (name === "profile") fillProfileForm();
  }

  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------
  async function handleSignUp(e) {
    e.preventDefault();
    if (!supabase) {
      toast(t("toast.configIncomplete"), "error");
      return;
    }
    const email = $("#signup-email").value.trim();
    const password = $("#signup-password").value;
    if (password.length < 6) {
      toast(t("toast.pwdShort"), "error");
      return;
    }
    els.authLoading?.classList.remove("hidden");
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast(error.message, "error");
        return;
      }
      if (data.user && !data.session) {
        toast(t("toast.checkEmail"), "success");
      } else {
        toast(t("toast.accountCreated"), "success");
      }
    } catch (err) {
      toast(err?.message || String(err), "error");
    } finally {
      els.authLoading?.classList.add("hidden");
    }
  }

  async function handleSignIn(e) {
    e.preventDefault();
    if (!supabase) {
      toast(t("toast.configIncomplete"), "error");
      return;
    }
    const email = $("#signin-email").value.trim();
    const password = $("#signin-password").value;
    els.authLoading?.classList.remove("hidden");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast(error.message, "error");
        return;
      }
      toast(t("toast.welcome"), "success");
    } catch (err) {
      toast(err?.message || String(err), "error");
    } finally {
      els.authLoading?.classList.add("hidden");
    }
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    cart = [];
    toast(t("toast.signedOut"), "info");
  }

  // ---------------------------------------------------------------------------
  // Profile (public.profiles)
  // ---------------------------------------------------------------------------
  async function loadProfile() {
    if (!currentUser) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();
    if (error) {
      console.error(error);
      toast(t("toast.profileLoadFail"), "error");
      return;
    }
    userProfile = data || {
      id: currentUser.id,
      email: currentUser.email,
      gender: "",
      style: "",
      budget: "",
    };
  }

  function fillProfileForm() {
    if (!userProfile) return;
    $("#profile-gender").value = userProfile.gender || "";
    $("#profile-style").value = userProfile.style || "";
    $("#profile-budget").value = userProfile.budget || "";
  }

  async function saveProfile(e) {
    e.preventDefault();
    if (!currentUser) return;
    const payload = {
      id: currentUser.id,
      email: currentUser.email,
      gender: $("#profile-gender").value.trim(),
      style: $("#profile-style").value.trim(),
      budget: $("#profile-budget").value.trim(),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("profiles").upsert(payload);
    if (error) {
      toast(error.message, "error");
      return;
    }
    userProfile = { ...userProfile, ...payload };
    toast(t("toast.profileSaved"), "success");
  }

  // ---------------------------------------------------------------------------
  // Products
  // ---------------------------------------------------------------------------
  async function loadProducts() {
    const grid = $("#product-grid");
    if (!grid) return;
    grid.innerHTML =
      '<div class="col-span-full flex justify-center py-16"><div class="skeleton h-40 w-full max-w-md rounded-2xl"></div></div>';
    const { data, error } = await supabase.from("products").select("*").order("created_at", {
      ascending: false,
    });
    if (error) {
      grid.innerHTML = `<p class="text-sm text-red-600 col-span-full">${escapeHtml(error.message)}</p>`;
      return;
    }
    products = data || [];
    renderProducts();
  }

  function renderProducts() {
    const grid = $("#product-grid");
    if (!grid) return;
    if (!products.length) {
      grid.innerHTML = `
        <div class="col-span-full empty-state rounded-3xl border border-dashed border-neutral-200 bg-neutral-50/80 px-8 py-16 text-center">
          <p class="text-lg font-medium text-neutral-900">${escapeHtml(t("shop.emptyTitle"))}</p>
          <p class="mt-2 text-sm text-neutral-500">${escapeHtml(t("shop.emptyBody"))}</p>
        </div>`;
      return;
    }
    grid.innerHTML = products
      .map(
        (p) => `
      <article class="card-hover flex flex-col rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm">
        <div class="mb-4 aspect-[4/3] w-full rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-400 text-xs">
          ${p.image_url ? `<img src="${escapeHtml(p.image_url)}" alt="" class="h-full w-full rounded-xl object-cover"/>` : escapeHtml(t("shop.noImage"))}
        </div>
        <h3 class="font-semibold text-neutral-900">${escapeHtml(p.name)}</h3>
        <p class="mt-1 flex-1 text-sm text-neutral-500 line-clamp-2">${escapeHtml(p.description || "")}</p>
        <div class="mt-4 flex items-center justify-between gap-2">
          <span class="text-lg font-semibold tracking-tight">$${Number(p.price).toFixed(2)}</span>
          <button type="button" data-add-cart="${escapeHtml(p.id)}" class="rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-neutral-800">
            ${escapeHtml(t("shop.addCart"))}
          </button>
        </div>
      </article>`
      )
      .join("");
    grid.querySelectorAll("[data-add-cart]").forEach((btn) => {
      btn.addEventListener("click", () => addToCart(btn.getAttribute("data-add-cart")));
    });
  }

  // ---------------------------------------------------------------------------
  // Cart (localStorage per user)
  // ---------------------------------------------------------------------------
  function cartStorageKey() {
    return currentUser ? `getdressai_cart_${currentUser.id}` : "getdressai_cart_guest";
  }

  function loadCartFromStorage() {
    try {
      const raw = localStorage.getItem(cartStorageKey());
      cart = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(cart)) cart = [];
    } catch {
      cart = [];
    }
  }

  function persistCart() {
    localStorage.setItem(cartStorageKey(), JSON.stringify(cart));
    updateCartBadge();
  }

  function updateCartBadge() {
    const n = cart.reduce((s, i) => s + (i.qty || 1), 0);
    const text = String(n);
    ["#cart-count", "#cart-count-desktop"].forEach((sel) => {
      const badge = $(sel);
      if (badge) {
        badge.textContent = text;
        badge.classList.toggle("hidden", n === 0);
      }
    });
  }

  function addToCart(productId) {
    if (!currentUser) {
      toast(t("toast.cartSignIn"), "error");
      return;
    }
    const p = products.find((x) => x.id === productId);
    if (!p) {
      toast(t("toast.productMissing"), "error");
      return;
    }
    const existing = cart.find((c) => c.product_id === productId);
    if (existing) existing.qty = (existing.qty || 1) + 1;
    else
      cart.push({
        product_id: p.id,
        name: p.name,
        price: Number(p.price),
        qty: 1,
      });
    persistCart();
    toast(t("toast.addedCart"), "success");
  }

  function removeFromCart(productId) {
    cart = cart.filter((c) => c.product_id !== productId);
    persistCart();
    renderCart();
  }

  function setQty(productId, qty) {
    const item = cart.find((c) => c.product_id === productId);
    if (!item) return;
    item.qty = Math.max(1, Number(qty) || 1);
    persistCart();
    renderCart();
  }

  function renderCart() {
    const root = $("#cart-root");
    if (!root) return;
    if (!currentUser) {
      root.innerHTML = `<p class="text-sm text-neutral-500">${escapeHtml(t("cart.signInView"))}</p>`;
      return;
    }
    loadCartFromStorage();
    if (!cart.length) {
      root.innerHTML = `
        <div class="empty-state rounded-3xl border border-dashed border-neutral-200 bg-neutral-50/80 px-8 py-16 text-center">
          <p class="text-lg font-medium text-neutral-900">${escapeHtml(t("cart.emptyTitle"))}</p>
          <p class="mt-2 text-sm text-neutral-500">${escapeHtml(t("cart.emptyBody"))}</p>
        </div>`;
      return;
    }
    const subtotal = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0);
    root.innerHTML = `
      <ul class="space-y-3">
        ${cart
          .map(
            (i) => `
          <li class="flex flex-wrap items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
            <div class="min-w-0 flex-1">
              <p class="font-medium text-neutral-900">${escapeHtml(i.name)}</p>
              <p class="text-sm text-neutral-500">$${i.price.toFixed(2)} ${escapeHtml(t("cart.each"))}</p>
            </div>
            <label class="flex items-center gap-2 text-sm text-neutral-600">
              ${escapeHtml(t("cart.qtyLabel"))}
              <input type="number" min="1" value="${i.qty}" data-qty="${escapeHtml(i.product_id)}"
                class="w-16 rounded-lg border border-neutral-200 px-2 py-1 text-neutral-900"/>
            </label>
            <p class="text-sm font-semibold">$${(i.price * (i.qty || 1)).toFixed(2)}</p>
            <button type="button" data-remove="${escapeHtml(i.product_id)}" class="text-sm text-red-600 hover:underline">${escapeHtml(t("cart.remove"))}</button>
          </li>`
          )
          .join("")}
      </ul>
      <div class="mt-8 flex flex-col gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-lg font-semibold">${escapeHtml(t("cart.totalLabel"))} <span class="ml-2">$${subtotal.toFixed(2)}</span></p>
        <button type="button" id="place-order-btn" class="rounded-full bg-neutral-900 px-8 py-3 text-sm font-medium text-white hover:bg-neutral-800">
          ${escapeHtml(t("cart.placeOrder"))}
        </button>
      </div>`;
    root.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => removeFromCart(btn.getAttribute("data-remove")));
    });
    root.querySelectorAll("[data-qty]").forEach((inp) => {
      inp.addEventListener("change", () =>
        setQty(inp.getAttribute("data-qty"), inp.value)
      );
    });
    $("#place-order-btn")?.addEventListener("click", placeOrder);
  }

  async function placeOrder() {
    if (!currentUser || !cart.length) return;
    const total = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0);
    const items = cart.map((i) => ({
      product_id: i.product_id,
      name: i.name,
      price: i.price,
      qty: i.qty,
    }));
    $("#place-order-btn").disabled = true;
    const { error } = await supabase.from("orders").insert({
      user_id: currentUser.id,
      items,
      total,
      status: "paid",
    });
    $("#place-order-btn").disabled = false;
    if (error) {
      toast(error.message, "error");
      return;
    }
    cart = [];
    persistCart();
    toast(t("toast.orderThanks"), "success");
    setView("orders");
  }

  // ---------------------------------------------------------------------------
  // Orders list
  // ---------------------------------------------------------------------------
  async function loadOrders() {
    const root = $("#orders-root");
    if (!root || !currentUser) return;
    root.innerHTML =
      '<div class="flex justify-center py-12"><div class="skeleton h-32 w-full max-w-lg rounded-2xl"></div></div>';
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });
    if (error) {
      root.innerHTML = `<p class="text-sm text-red-600">${escapeHtml(error.message)}</p>`;
      return;
    }
    const orders = data || [];
    if (!orders.length) {
      root.innerHTML = `
        <div class="empty-state rounded-3xl border border-dashed border-neutral-200 bg-neutral-50/80 px-8 py-16 text-center">
          <p class="text-lg font-medium text-neutral-900">${escapeHtml(t("orders.emptyTitle"))}</p>
          <p class="mt-2 text-sm text-neutral-500">${escapeHtml(t("orders.emptyBody"))}</p>
        </div>`;
      return;
    }
    root.innerHTML = `<ul class="space-y-4">${orders
      .map(
        (o) => `
      <li class="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xs font-mono text-neutral-400">${escapeHtml(o.id)}</span>
          <span class="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">${escapeHtml(o.status)}</span>
        </div>
        <p class="mt-2 text-lg font-semibold">$${Number(o.total).toFixed(2)}</p>
        <p class="text-xs text-neutral-400">${formatDate(o.created_at)}</p>
        <ul class="mt-3 space-y-1 text-sm text-neutral-600">
          ${(Array.isArray(o.items) ? o.items : [])
            .map(
              (it) =>
                `<li>• ${escapeHtml(it.name)} × ${it.qty} — $${(Number(it.price) * Number(it.qty)).toFixed(2)}</li>`
            )
            .join("")}
        </ul>
      </li>`
      )
      .join("")}</ul>`;
  }

  // ---------------------------------------------------------------------------
  // Outfit generator (OpenRouter / Groq via /api/outfit proxy — never put API keys here)
  // ---------------------------------------------------------------------------
  /** Strip optional ```json fences from model output. */
  function extractJsonFromAssistantText(text) {
    const bodyText = String(text || "").trim();
    const fence = bodyText.match(/^```(?:json)?\s*([\s\S]*?)```$/im);
    if (fence) return fence[1].trim();
    const inner = bodyText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (inner) return inner[1].trim();
    return bodyText;
  }

  const SESSION_GEN_KEY = "getdressai_gen_history";

  function normalizeOutfitPrompt(p) {
    return String(p || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokenSetForSimilarity(text) {
    return new Set(
      normalizeOutfitPrompt(text)
        .split(" ")
        .filter((w) => w.length > 1)
    );
  }

  /** Jaccard similarity on word sets (0–1). */
  function jaccardTokenSimilarity(a, b) {
    const A = tokenSetForSimilarity(a);
    const B = tokenSetForSimilarity(b);
    if (A.size === 0 && B.size === 0) return 1;
    if (A.size === 0 || B.size === 0) return 0;
    let inter = 0;
    for (const w of A) {
      if (B.has(w)) inter++;
    }
    const union = A.size + B.size - inter;
    return union ? inter / union : 0;
  }

  function getSessionGenerations() {
    try {
      const raw = sessionStorage.getItem(SESSION_GEN_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function setSessionGenerations(list) {
    try {
      sessionStorage.setItem(SESSION_GEN_KEY, JSON.stringify(list.slice(0, 25)));
    } catch {
      /* ignore quota */
    }
  }

  function pushSessionGeneration(normPrompt, prompt, looks) {
    if (!Array.isArray(looks) || !looks.length) return;
    const list = getSessionGenerations().filter((x) => x.normPrompt !== normPrompt);
    list.unshift({ normPrompt, prompt, looks, ts: Date.now() });
    setSessionGenerations(list);
  }

  function truncateForAiContext(str, max = 7500) {
    if (str.length <= max) return str;
    return str.slice(0, max) + "\n…(truncated)";
  }

  function findBestSimilarOutfitRow(prompt, rows) {
    const norm = normalizeOutfitPrompt(prompt);
    let best = null;
    let bestScore = 0;
    for (const row of rows) {
      const rp = row.prompt || "";
      if (normalizeOutfitPrompt(rp) === norm) continue;
      const s = jaccardTokenSimilarity(prompt, rp);
      if (s > bestScore) {
        bestScore = s;
        best = row;
      }
    }
    if (best && bestScore >= 0.55) return { row: best, score: bestScore };
    return null;
  }

  function findBestSimilarSessionEntry(prompt, sessList) {
    const norm = normalizeOutfitPrompt(prompt);
    let best = null;
    let bestScore = 0;
    for (const h of sessList) {
      if (h.normPrompt === norm) continue;
      const s = jaccardTokenSimilarity(prompt, h.prompt || "");
      if (s > bestScore) {
        bestScore = s;
        best = h;
      }
    }
    if (best && bestScore >= 0.55) return { looks: best.looks, score: bestScore };
    return null;
  }

  function buildOutfitSystemPrompt() {
    const g = userProfile?.gender || "not specified";
    const s = userProfile?.style || "not specified";
    const b = userProfile?.budget || "not specified";
    const lang = languageInstructionForAI();
    const region = regionHintForAI();
    return `You are a professional stylist.
Give short, stylish outfit + brand suggestions. Respect the user's budget: ${b}.

User profile: gender preference: ${g}, preferred style: ${s}.

${lang}
Regional / retail context (prioritize items shoppers can realistically find in this market): ${region}

Return ONLY valid JSON with this exact shape (no markdown, no extra text):
{"looks":[{"title":"string","summary":"string","pieces":[{"name":"string","note":"string"}],"colors":["string"],"tips":["string"]}]}
Use each piece's "note" for brand names and/or price tier (budget/mid/luxury). Provide 2–3 distinct looks.`;
  }

  async function generateOutfits(e) {
    e.preventDefault();
    const prompt = $("#outfit-prompt").value.trim();
    if (!prompt) {
      toast(t("toast.enterPrompt"), "error");
      return;
    }
    const btn = $("#generate-btn");
    const out = $("#generator-output");
    const norm = normalizeOutfitPrompt(prompt);

    const sessList = getSessionGenerations();
    const sessExact = sessList.find((x) => x.normPrompt === norm);
    if (sessExact?.looks?.length) {
      window.__lastOutfitPayload = { prompt, looks: sessExact.looks };
      renderOutfitCards(sessExact.looks, out, {
        showSaveButton: true,
        referenceBanner:
          "Same request as recently — showing your last result (no new AI call). Refresh the page or change the text for a new generation.",
      });
      toast(t("toast.sessionLoaded"), "info");
      return;
    }

    let wardrobeRows = [];
    if (currentUser && supabase) {
      const { data: outfitRows, error: outfitErr } = await supabase
        .from("outfits")
        .select("id,prompt,suggestions,created_at")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (!outfitErr && outfitRows?.length) wardrobeRows = outfitRows;
    }

    if (wardrobeRows.length) {
      const exactRow = wardrobeRows.find(
        (o) => normalizeOutfitPrompt(o.prompt || "") === norm
      );
      if (exactRow?.suggestions?.length) {
        window.__lastOutfitPayload = { prompt, looks: exactRow.suggestions };
        renderOutfitCards(exactRow.suggestions, out, {
          showSaveButton: true,
          referenceBanner:
            "Same prompt as a saved outfit in your wardrobe — showing that result (no new AI call).",
        });
          toast(t("toast.showingSaved"), "success");
        return;
      }
    }

    let referenceLooksJson = null;
    let contextHint = "";

    if (wardrobeRows.length) {
      const sim = findBestSimilarOutfitRow(prompt, wardrobeRows);
      if (sim?.row?.suggestions?.length) {
        referenceLooksJson = truncateForAiContext(
          JSON.stringify(sim.row.suggestions)
        );
        const sp = sim.row.prompt || "";
        contextHint = `Similar saved request: "${sp.slice(0, 140)}${sp.length > 140 ? "…" : ""}"`;
      }
    }

    if (!referenceLooksJson) {
      const simSess = findBestSimilarSessionEntry(prompt, sessList);
      if (simSess?.looks?.length) {
        referenceLooksJson = truncateForAiContext(JSON.stringify(simSess.looks));
        contextHint = "Similar request earlier in this session.";
      }
    }

    btn.disabled = true;
    out.innerHTML =
      '<div class="space-y-4">' +
      [1, 2, 3]
        .map(
          () =>
            '<div class="skeleton h-48 w-full rounded-2xl"></div>'
        )
        .join("") +
      "</div>";

    let userContent = `Outfit request: ${prompt}`;
    if (referenceLooksJson) {
      userContent += `\n\nPrevious outfit JSON for a similar request — use as a base: refine, vary pieces, or adjust for the exact wording above. Keep the same response shape (top-level key "looks").\n${referenceLooksJson}`;
    }

    const chatBody = {
      model: CHAT_MODEL,
      messages: [
        { role: "system", content: buildOutfitSystemPrompt() },
        { role: "user", content: userContent },
      ],
      temperature: 0.7,
    };

    try {
      const res = await fetch(AI_PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatBody),
      });
      const json = await res.json();
      if (!res.ok) {
        const errMsg =
          json.error?.message ||
          json.message ||
          json.msg ||
          json.code ||
          res.statusText ||
          "OpenRouter / Groq error";
        throw new Error(String(errMsg));
      }
      const rawContent = json.choices?.[0]?.message?.content;
      const content =
        typeof rawContent === "string"
          ? rawContent
          : rawContent != null
            ? JSON.stringify(rawContent)
            : "";
      const jsonText = extractJsonFromAssistantText(content);
      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        throw new Error("Could not parse AI response as JSON.");
      }
      const looks = Array.isArray(parsed.looks) ? parsed.looks : [];
      if (!looks.length) throw new Error("No looks in response.");
      pushSessionGeneration(norm, prompt, looks);
      window.__lastOutfitPayload = { prompt, looks };
      const refBanner =
        referenceLooksJson && contextHint
          ? `Built using your earlier look as context. ${contextHint}`
          : null;
      renderOutfitCards(looks, out, {
        showSaveButton: true,
        referenceBanner: refBanner || undefined,
      });
      toast(
        referenceLooksJson ? t("toast.genContext") : t("toast.genOk"),
        "success"
      );
    } catch (err) {
      out.innerHTML = `<div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">${escapeHtml(err.message || String(err))}</div>`;
      toast(err.message || t("toast.genFail"), "error");
    } finally {
      btn.disabled = false;
    }
  }

  /**
   * @param {object[]} looks
   * @param {HTMLElement} container
   * @param {{ showSaveButton?: boolean, amazonSearchQuery?: string, referenceBanner?: string }} [opts]
   */
  function renderOutfitCards(looks, container, opts = {}) {
    const showSave = opts.showSaveButton !== false;
    const amazonQ = String(
      opts.amazonSearchQuery ?? window.__lastOutfitPayload?.prompt ?? ""
    ).trim();
    const amazonHref =
      amazonQ && AMAZON_AFFILIATE_TAG
        ? amazonAssociateSearchUrl(amazonQ, AMAZON_AFFILIATE_TAG)
        : "";
    const amazonBlock = amazonHref
      ? `<div class="mt-8 flex justify-center">
        <a href="${amazonHref}" target="_blank" rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700">
          ${escapeHtml(t("outfit.shopAmazon"))}
        </a>
      </div>`
      : "";
    const refBlock = opts.referenceBanner
      ? `<div class="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-950">${escapeHtml(opts.referenceBanner)}</div>`
      : "";
    container.innerHTML = `${refBlock}
      <div class="grid gap-6 md:grid-cols-2">
        ${looks
          .map(
            (look, idx) => `
          <article class="card-hover rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
            <p class="text-xs font-medium uppercase tracking-widest text-neutral-400">${escapeHtml(t("outfit.lookLabel"))} ${idx + 1}</p>
            <h3 class="mt-2 text-xl font-semibold tracking-tight text-neutral-900">${escapeHtml(look.title || t("outfit.untitled"))}</h3>
            <p class="mt-2 text-sm leading-relaxed text-neutral-600">${escapeHtml(look.summary || "")}</p>
            <div class="mt-4">
              <p class="text-xs font-semibold uppercase tracking-wider text-neutral-400">${escapeHtml(t("outfit.pieces"))}</p>
              <ul class="mt-2 space-y-2 text-sm text-neutral-700">
                ${(Array.isArray(look.pieces) ? look.pieces : [])
                  .map(
                    (pc) =>
                      `<li><span class="font-medium">${escapeHtml(pc.name || "")}</span>${pc.note ? ` — ${escapeHtml(pc.note)}` : ""}</li>`
                  )
                  .join("")}
              </ul>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              ${(Array.isArray(look.colors) ? look.colors : [])
                .map(
                  (c) =>
                    `<span class="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">${escapeHtml(c)}</span>`
                )
                .join("")}
            </div>
            <div class="mt-4 border-t border-neutral-100 pt-4">
              <p class="text-xs font-semibold uppercase tracking-wider text-neutral-400">${escapeHtml(t("outfit.tips"))}</p>
              <ul class="mt-2 list-disc pl-4 text-sm text-neutral-600">
                ${(Array.isArray(look.tips) ? look.tips : [])
                  .map((tip) => `<li>${escapeHtml(tip)}</li>`)
                  .join("")}
              </ul>
            </div>
          </article>`
          )
          .join("")}
      </div>
      ${amazonBlock}
      ${
        showSave
          ? `<div class="mt-8 flex justify-center">
        <button type="button" id="save-outfit-btn" class="rounded-full border border-neutral-300 bg-white px-8 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50">
          ${escapeHtml(t("outfit.saveWardrobe"))}
        </button>
      </div>`
          : ""
      }`;
    if (showSave) {
      $("#save-outfit-btn")?.addEventListener("click", saveCurrentOutfit);
    }
  }

  async function saveCurrentOutfit() {
    if (!currentUser) {
      toast(t("toast.saveSignIn"), "error");
      return;
    }
    const payload = window.__lastOutfitPayload;
    if (!payload?.looks?.length) {
      toast(t("toast.genFirst"), "error");
      return;
    }
    const title =
      payload.looks[0]?.title?.slice(0, 80) || payload.prompt.slice(0, 60);
    const { error } = await supabase.from("outfits").insert({
      user_id: currentUser.id,
      title,
      prompt: payload.prompt,
      suggestions: payload.looks,
    });
    if (error) {
      toast(error.message, "error");
      return;
    }
    toast(t("toast.savedWardrobe"), "success");
    loadOutfits();
  }

  // ---------------------------------------------------------------------------
  // Saved outfits
  // ---------------------------------------------------------------------------
  async function loadOutfits() {
    const root = $("#saved-root");
    if (!root || !currentUser) return;
    root.innerHTML =
      '<div class="flex justify-center py-12"><div class="skeleton h-40 w-full max-w-md rounded-2xl"></div></div>';
    const { data, error } = await supabase
      .from("outfits")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });
    if (error) {
      root.innerHTML = `<p class="text-sm text-red-600">${escapeHtml(error.message)}</p>`;
      return;
    }
    savedOutfits = data || [];
    renderSavedOutfits();
  }

  function renderSavedOutfits() {
    const root = $("#saved-root");
    if (!root) return;
    if (!savedOutfits.length) {
      root.innerHTML = `
        <div class="empty-state rounded-3xl border border-dashed border-neutral-200 bg-neutral-50/80 px-8 py-16 text-center">
          <p class="text-lg font-medium text-neutral-900">${escapeHtml(t("wardrobe.emptyTitle"))}</p>
          <p class="mt-2 text-sm text-neutral-500">${escapeHtml(t("wardrobe.emptyBody"))}</p>
        </div>`;
      return;
    }
    root.innerHTML = savedOutfits
      .map(
        (o) => `
      <article class="mb-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm" data-outfit-id="${escapeHtml(o.id)}">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 class="text-lg font-semibold text-neutral-900">${escapeHtml(o.title || t("outfit.savedDefaultTitle"))}</h3>
            <p class="mt-1 text-sm text-neutral-500">${escapeHtml(o.prompt)}</p>
            <p class="mt-2 text-xs text-neutral-400">${formatDate(o.created_at)}</p>
          </div>
          <button type="button" class="text-sm text-red-600 hover:underline" data-delete-outfit="${escapeHtml(o.id)}">${escapeHtml(t("common.delete"))}</button>
        </div>
        <div class="mt-6 generator-nested"></div>
      </article>`
      )
      .join("");
    root.querySelectorAll("[data-delete-outfit]").forEach((btn) => {
      btn.addEventListener("click", () => deleteOutfit(btn.getAttribute("data-delete-outfit")));
    });
    savedOutfits.forEach((o) => {
      const art = root.querySelector(`[data-outfit-id="${o.id}"]`);
      const nest = art?.querySelector(".generator-nested");
      if (nest && Array.isArray(o.suggestions)) {
        renderOutfitCards(o.suggestions, nest, {
          showSaveButton: false,
          amazonSearchQuery: o.prompt || "",
        });
      }
    });
  }

  async function deleteOutfit(id) {
    const { error } = await supabase.from("outfits").delete().eq("id", id);
    if (error) {
      toast(error.message, "error");
      return;
    }
    toast(t("toast.outfitRemoved"), "info");
    loadOutfits();
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDate(iso) {
    if (!iso) return "";
    try {
      const loc = getLocale();
      const tag =
        loc === "uz" ? "uz-UZ" : loc === "ru" ? "ru-RU" : "en-US";
      return new Date(iso).toLocaleString(tag, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  }

  function bindNav() {
    $$("[data-nav]").forEach((btn) => {
      btn.addEventListener("click", () => setView(btn.getAttribute("data-nav")));
    });
  }

  function wireLocaleAndRegion() {
    fillLocaleSelects();
    fillRegionSelects();
    applyI18n();
    document.querySelectorAll("[data-locale-select]").forEach((sel) => {
      sel.addEventListener("change", () => {
        const v = sel.value;
        setLocale(v);
        document.querySelectorAll("[data-locale-select]").forEach((s) => {
          s.value = v;
        });
        refreshRegionOptions();
        applyI18n();
        rerenderDynamicI18n();
      });
    });
    document.querySelectorAll("[data-region-select]").forEach((sel) => {
      sel.addEventListener("change", () => {
        const v = sel.value;
        setRegion(v);
        document.querySelectorAll("[data-region-select]").forEach((s) => {
          s.value = v;
        });
      });
    });
  }

  function rerenderDynamicI18n() {
    if (currentViewName === "shop") loadProducts();
    if (currentViewName === "cart") renderCart();
    if (currentViewName === "orders") loadOrders();
    if (currentViewName === "saved") loadOutfits();
    if (currentViewName === "generate") {
      const out = $("#generator-output");
      const payload = window.__lastOutfitPayload;
      if (out && payload?.looks?.length) {
        renderOutfitCards(payload.looks, out, { showSaveButton: true });
      }
    }
  }

  async function onAuthChange(session) {
    currentUser = session?.user ?? null;
    $("#shell-auth")?.classList.toggle("hidden", !!currentUser);
    $("#shell-app")?.classList.toggle("hidden", !currentUser);
    const emailLabel = $("#user-email-label");
    if (emailLabel) {
      emailLabel.textContent = currentUser?.email || "";
      emailLabel.classList.toggle("hidden", !currentUser?.email);
    }

    if (currentUser) {
      loadCartFromStorage();
      await loadProfile();
      fillProfileForm();
      updateCartBadge();
      setView("generate");
    } else {
      userProfile = null;
      cart = [];
      updateCartBadge();
    }
  }

  function cacheElements() {
    els = {
      toastHost: $("#toast-host"),
      authLoading: $("#auth-loading"),
    };
  }

  function bindAuthUi() {
    $("#signup-form")?.addEventListener("submit", handleSignUp);
    $("#signin-form")?.addEventListener("submit", handleSignIn);
    $("#toggle-auth-mode")?.addEventListener("click", () => {
      $("#signin-panel")?.classList.toggle("hidden");
      $("#signup-panel")?.classList.toggle("hidden");
    });
  }

  function init() {
    cacheElements();
    wireLocaleAndRegion();
    bindAuthUi();
    if (!validateConfig()) return;

    bindNav();
    $("#signout-btn")?.addEventListener("click", handleSignOut);
    $("#profile-form")?.addEventListener("submit", saveProfile);
    $("#outfit-form")?.addEventListener("submit", generateOutfits);

    supabase.auth.onAuthStateChange((_event, session) => {
      onAuthChange(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      onAuthChange(session);
    });
  }

document.addEventListener("DOMContentLoaded", init);
