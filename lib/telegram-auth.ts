export function validateTelegramApiKey(request: Request): boolean {
  const header = request.headers.get("x-api-key");
  const expected = process.env.TELEGRAM_API_KEY;

  if (!expected) return false;
  return header === expected;
}
