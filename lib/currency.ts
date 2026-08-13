// Currency formatting utilities for UZS (Uzbek Som)
// Uses integer arithmetic to avoid floating-point precision issues

/**
 * Format a number as UZS currency string.
 * Example: 1250000 → "1 250 000 сўм"
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0 сўм";
  // Round to avoid floating point display issues
  const rounded = Math.round(value);
  return rounded.toLocaleString("uz-UZ").replace(/,/g, " ") + " сўм";
}

/**
 * Format without currency symbol (for inputs/tables)
 */
export function formatAmount(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0";
  return Math.round(value).toLocaleString("uz-UZ").replace(/,/g, " ");
}

/**
 * Parse a currency string back to number
 */
export function parseCurrency(str: string): number {
  const cleaned = str.replace(/[^\d.-]/g, "");
  return parseFloat(cleaned) || 0;
}

/**
 * Multiply two monetary values and round to avoid float errors.
 * Use this for price × quantity calculations.
 */
export function multiply(a: number, b: number): number {
  return Math.round(a * b * 100) / 100;
}

/**
 * Safe addition of monetary values
 */
export function addMoney(...values: number[]): number {
  return Math.round(values.reduce((sum, v) => sum + (v || 0), 0) * 100) / 100;
}

/**
 * Calculate gross profit: revenue - cogs
 */
export function calcGrossProfit(revenue: number, cogs: number): number {
  return addMoney(revenue, -cogs);
}

/**
 * Calculate net profit: gross_profit - expenses
 */
export function calcNetProfit(grossProfit: number, expenses: number): number {
  return addMoney(grossProfit, -expenses);
}
