export const prerender = false;

import type { APIRoute } from "astro";
import { getDb } from "../../db";

declare const __GIT_COMMIT__: string;

export const GET: APIRoute = async () => {
  let dbOk = false;
  try {
    const db = getDb();
    await db.query.users.findFirst();
    dbOk = true;
  } catch {
    // DB unreachable
  }

  return new Response(
    JSON.stringify({
      status: dbOk ? "ok" : "degraded",
      db: dbOk ? "connected" : "unreachable",
      version: __GIT_COMMIT__,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
