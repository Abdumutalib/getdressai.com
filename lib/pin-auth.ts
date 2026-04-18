"use client";

const PIN_STORAGE_KEY = "getdressai-pin-auth";

type PinAuthRecord = {
  email: string;
  salt: string;
  iv: string;
  ciphertext: string;
};

function toBufferSource(bytes: Uint8Array) {
  return Uint8Array.from(bytes);
}

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
      salt: toBufferSource(salt),
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

export async function savePinAuthRecord(email: string, password: string, pin: string) {
  if (!isBrowserReady()) {
    throw new Error("PIN login is not available in this browser.");
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pin, salt);
  const payload = new TextEncoder().encode(password);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: toBufferSource(iv) }, key, toBufferSource(payload));
  const record: PinAuthRecord = {
    email,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(encrypted))
  };

  window.localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(record));
}

export async function unlockPinAuthRecord(pin: string) {
  const record = readPinAuthRecord();
  if (!record) {
    throw new Error("No PIN login found on this device.");
  }

  const salt = fromBase64(record.salt);
  const iv = fromBase64(record.iv);
  const ciphertext = fromBase64(record.ciphertext);
  const key = await deriveKey(pin, salt);

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: toBufferSource(iv) },
      key,
      toBufferSource(ciphertext)
    );
    return {
      email: record.email,
      password: new TextDecoder().decode(decrypted)
    };
  } catch {
    throw new Error("Incorrect PIN code.");
  }
}
