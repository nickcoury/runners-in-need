import { getEnv } from "./env";

const TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

async function hmac(data: string): Promise<string> {
  const secret = getEnv("AUTH_SECRET");
  if (!secret) throw new Error("AUTH_SECRET is required");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Generate an HMAC-based action token for email one-click links. */
export async function createActionToken(needId: string): Promise<string> {
  const timestamp = Date.now().toString();
  const mac = await hmac(needId + ":" + timestamp);
  return timestamp + "." + mac;
}

/** Verify an action token using timing-safe comparison. */
export async function verifyActionToken(needId: string, token: string): Promise<boolean> {
  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) return false;

  const timestamp = token.substring(0, dotIndex);
  const providedMac = token.substring(dotIndex + 1);

  // Check expiration
  const tokenAge = Date.now() - Number(timestamp);
  if (isNaN(tokenAge) || tokenAge < 0 || tokenAge > TOKEN_MAX_AGE_MS) {
    return false;
  }

  // Verify HMAC
  const expectedMac = await hmac(needId + ":" + timestamp);
  const encoder = new TextEncoder();
  const a = encoder.encode(providedMac);
  const b = encoder.encode(expectedMac);
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  return crypto.subtle.timingSafeEqual(a, b);
}
