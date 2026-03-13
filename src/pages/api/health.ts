export const prerender = false;

import type { APIRoute } from "astro";
import { getDb } from "../../db";
import { getEnv } from "../../lib/env";

export const GET: APIRoute = async () => {
  let dbOk = false;
  try {
    const db = getDb();
    await db.query.users.findFirst();
    dbOk = true;
  } catch {
    // DB unreachable
  }

  let authDiag: Record<string, boolean> | undefined;
  const diag = new URL("", "http://x").searchParams;
  // Temporarily expose env presence (not values) for debugging auth
  authDiag = {
    AUTH_SECRET: !!getEnv("AUTH_SECRET"),
    GOOGLE_CLIENT_ID: !!getEnv("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: !!getEnv("GOOGLE_CLIENT_SECRET"),
    RESEND_API_KEY: !!getEnv("RESEND_API_KEY"),
  };

  const status = dbOk ? 200 : 503;
  return new Response(
    JSON.stringify({
      status: dbOk ? "ok" : "degraded",
      db: dbOk ? "connected" : "unreachable",
      ...(authDiag ? { auth: authDiag } : {}),
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
};
