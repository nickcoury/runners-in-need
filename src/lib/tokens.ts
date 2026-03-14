import { getEnv } from "./env";

/** Generate an HMAC-based action token for email one-click links. */
export async function createActionToken(needId: string): Promise<string> {
  const secret = getEnv("AUTH_SECRET") || "dev-secret";
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(needId));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Verify an action token. */
export async function verifyActionToken(needId: string, token: string): Promise<boolean> {
  const expected = await createActionToken(needId);
  return token === expected;
}
