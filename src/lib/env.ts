/**
 * Get an environment variable at runtime.
 *
 * On Cloudflare Workers (Astro v6), secrets and vars are accessed via
 * `import { env } from "cloudflare:workers"`. Falls back to import.meta.env
 * for local dev and build time.
 */
export function getEnv(key: string): string | undefined {
  try {
    // @ts-ignore — cloudflare:workers is only available at runtime on Workers
    const { env } = require("cloudflare:workers");
    if (env?.[key]) return env[key] as string;
  } catch {
    // Not in Cloudflare runtime
  }
  return (import.meta.env as any)?.[key] || undefined;
}
