import { describe, expect, it } from "vitest";
import { addMoney, formatMoney, subMoney, toMinor, fromMinor } from "@/utils/currency";

describe("currency helpers", () => {
  it("formats UZS values in uz locale", () => {
    expect(formatMoney(1250000).replace(/\u00A0/g, " ")).toBe("1 250 000 сўм");
  });

  it("handles precise addition with minor units", () => {
    expect(addMoney(0.1, 0.2)).toBe(0.3);
  });

  it("handles precise subtraction with minor units", () => {
    expect(subMoney(1, 0.9)).toBe(0.1);
  });

  it("converts to/from minor units", () => {
    expect(toMinor(12.34)).toBe(BigInt(1234));
    expect(fromMinor(BigInt(250))).toBe(2.5);
  });
});
