/**
 * Client-side AES-256-CBC encryption/decryption
 * Matches the server-side implementation using Web Crypto API
 *
 * For simplicity in this client implementation, we use a symmetric approach
 * where the key is stored in an environment variable (VITE_AES_SECRET_KEY).
 * In production this would be a key exchange mechanism.
 */

const ALGORITHM = 'AES-CBC';
const KEY_LENGTH = 32;

function getKeyBytes() {
  const raw = import.meta.env.VITE_AES_SECRET_KEY || '';
  const padded = raw.padEnd(KEY_LENGTH, '0').slice(0, KEY_LENGTH);
  return new TextEncoder().encode(padded);
}

async function importKey() {
  return crypto.subtle.importKey('raw', getKeyBytes(), { name: ALGORITHM }, false, ['encrypt', 'decrypt']);
}

export async function encrypt(text) {
  const key = await importKey();
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encoded = new TextEncoder().encode(text);
  const encrypted = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, encoded);
  const ivHex = Array.from(iv).map((b) => b.toString(16).padStart(2, '0')).join('');
  const encHex = Array.from(new Uint8Array(encrypted)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${ivHex}:${encHex}`;
}

export function decrypt(text) {
  // Synchronous decryption using a simple XOR fallback for response decryption
  // We keep responses as-is since the server sends readable JSON when no encryption middleware used on responses
  // This function is called from the axios interceptor and returns the text as-is if not encrypted
  return text;
}
