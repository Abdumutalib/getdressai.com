export function formatMoney(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `${new Intl.NumberFormat("uz-UZ", {
    maximumFractionDigits: 0,
  }).format(Math.round(safe))} сўм`;
}

export function toMinor(value: number): bigint {
  return BigInt(Math.round(value * 100));
}

export function fromMinor(value: bigint): number {
  return Number(value) / 100;
}

export function addMoney(a: number, b: number): number {
  return fromMinor(toMinor(a) + toMinor(b));
}

export function subMoney(a: number, b: number): number {
  return fromMinor(toMinor(a) - toMinor(b));
}
