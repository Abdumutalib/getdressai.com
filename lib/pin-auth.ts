"use client";

import type { Session } from "@supabase/supabase-js";

const PIN_STORAGE_KEY = "getdressai-pin-auth";
const PIN_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const PIN_RECORD_VERSION = 2;

type PinSessionPayload = {
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

type PinAuthRecord = {
  version: number;
  savedAt: number;
  email: string;
  salt: string;
  iv: string;
  ciphertext: string;
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

async function deriveKey(pin: string, salt: Uint8Array) {
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, [
    "deriveKey"
  ]);

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: Uint8Array.from(salt),
      iterations: 120000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
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

    const record = JSON.parse(raw) as Partial<PinAuthRecord>;
    if (
      record.version !== PIN_RECORD_VERSION ||
      typeof record.savedAt !== "number" ||
      !Number.isFinite(record.savedAt) ||
      typeof record.email !== "string" ||
      typeof record.salt !== "string" ||
      typeof record.iv !== "string" ||
      typeof record.ciphertext !== "string"
    ) {
      clearPinAuthRecord();
      return null;
    }

    return record as PinAuthRecord;
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

export async function savePinAuthRecord(email: string, pin: string, session: Session) {
  if (!isBrowserReady()) {
    throw new Error("PIN login is not available in this browser.");
  }

  if (!session.access_token || !session.refresh_token) {
    throw new Error("PIN login is not available yet.");
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pin, salt);
  const payload: PinSessionPayload = {
    email,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: Date.now() + PIN_SESSION_TTL_MS
  };

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(JSON.stringify(payload))
  );

  const record: PinAuthRecord = {
    version: PIN_RECORD_VERSION,
    savedAt: Date.now(),
    email,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(encrypted))
  };

  window.localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(record));
}

export async function verifyPinAuthRecord(pin: string) {
  const record = readPinAuthRecord();
  if (!record) {
    throw new Error("No PIN login found on this device.");
  }

  try {
    const key = await deriveKey(pin, fromBase64(record.salt));
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(record.iv) },
      key,
      fromBase64(record.ciphertext)
    );
    const payload = JSON.parse(new TextDecoder().decode(decrypted)) as PinSessionPayload;

    if (!payload.expiresAt || payload.expiresAt < Date.now()) {
      clearPinAuthRecord();
      throw new Error("Saved PIN login expired.");
    }

    return payload;
  } catch (error) {
    if (error instanceof Error && error.message === "Saved PIN login expired.") {
      throw error;
    }

    throw new Error("Incorrect PIN code.");
  }
}
