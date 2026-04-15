/**
 * Chat-completions proxy validation — abuse / cost control (size limits).
 * Env: MAX_CHAT_BODY_CHARS (default 80000), optional overrides via options.
 */

const DEFAULT_MAX_TOTAL = 80000;
const DEFAULT_MAX_MESSAGES = 40;
const DEFAULT_MAX_PER_MESSAGE = 48000;
const MAX_MODEL_LEN = 120;

/**
 * @param {unknown} body
 * @param {{ maxTotalChars?: number, maxMessages?: number, maxPerMessageChars?: number }} [options]
 * @returns {string | null} error message or null if OK
 */
export function validateChatCompletionsBody(body, options = {}) {
  const envMax = Number(process.env.MAX_CHAT_BODY_CHARS);
  const maxTotal =
    options.maxTotalChars ??
    (Number.isFinite(envMax) && envMax > 0 ? envMax : DEFAULT_MAX_TOTAL);
  const maxMessages = options.maxMessages ?? DEFAULT_MAX_MESSAGES;
  const maxPerMsg = options.maxPerMessageChars ?? DEFAULT_MAX_PER_MESSAGE;

  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return "Invalid JSON body";
  }
  const msgs = body.messages;
  if (!Array.isArray(msgs) || msgs.length === 0) {
    return "Missing or empty messages array";
  }
  if (msgs.length > maxMessages) {
    return "Too many messages";
  }
  let total = 0;
  for (const m of msgs) {
    if (!m || typeof m !== "object" || Array.isArray(m)) {
      return "Invalid message object";
    }
    const role = m.role;
    if (role !== "system" && role !== "user" && role !== "assistant") {
      return "Invalid message role";
    }
    const c = m.content;
    const text =
      typeof c === "string"
        ? c
        : c != null && typeof c === "object"
          ? JSON.stringify(c)
          : String(c ?? "");
    if (text.length > maxPerMsg) {
      return "Single message too long";
    }
    total += text.length;
  }
  if (total > maxTotal) {
    return "Combined prompt exceeds server limit";
  }
  if (
    body.model != null &&
    (typeof body.model !== "string" || body.model.length > MAX_MODEL_LEN)
  ) {
    return "Invalid model field";
  }
  return null;
}
