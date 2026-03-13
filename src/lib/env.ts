/**
 * Get an environment variable at runtime.
 *
 * Uses Astro's internal env runtime which the Cloudflare adapter configures
 * with Worker bindings via `setGetEnv(createGetEnv(env))`.
 * Falls back to process.env for local dev / build time.
 */
// @ts-ignore — internal Astro module
import { getEnv as astroGetEnv } from "astro/env/runtime";

export function getEnv(key: string): string | undefined {
  return astroGetEnv(key) || undefined;
}
