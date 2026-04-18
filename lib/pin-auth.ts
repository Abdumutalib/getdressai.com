"use client";

const PIN_STORAGE_KEY = "getdressai-pin-auth";

type PinAuthRecord = {
  email: string;
  salt: string;
  hash: string;
};

function toBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function hashPin(pin: string, salt: Uint8Array) {
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, [
    "deriveBits"
  ]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: Uint8Array.from(salt),
      iterations: 120000,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );

  return toBase64(new Uint8Array(bits));
}

function isBrowserReady() {
  return typeof window !== "undefined" && typeof crypto !== "undefined" && Boolean(crypto.subtle);
}

export function readPinAuthRecord() {
  if (!isBrowserReady()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(PIN_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as PinAuthRecord;
  } catch {
    return null;
  }
}

export function clearPinAuthRecord() {
  if (!isBrowserReady()) {
    return;
  }

  try {
    window.localStorage.removeItem(PIN_STORAGE_KEY);
  } catch {
    return;
  }
}

export async function savePinAuthRecord(email: string, pin: string) {
  if (!isBrowserReady()) {
    throw new Error("PIN login is not available in this browser.");
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const record: PinAuthRecord = {
    email,
    salt: toBase64(salt),
    hash: await hashPin(pin, salt)
  };

  window.localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(record));
}

export async function verifyPinAuthRecord(pin: string) {
  const record = readPinAuthRecord();
  if (!record) {
    throw new Error("No PIN login found on this device.");
  }

  const salt = fromBase64(record.salt);
  const hash = await hashPin(pin, salt);

  if (hash !== record.hash) {
    throw new Error("Incorrect PIN code.");
  }

  return { email: record.email };
}
