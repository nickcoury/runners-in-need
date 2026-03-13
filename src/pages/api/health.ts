export const prerender = false;

import type { APIRoute } from "astro";
import { getDb } from "../../db";

export const GET: APIRoute = async () => {
  let dbOk = false;
  try {
    const db = getDb();
    await db.query.users.findFirst();
    dbOk = true;
  } catch {
    // DB unreachable
  }

  const status = dbOk ? 200 : 503;
  return new Response(
    JSON.stringify({
      status: dbOk ? "ok" : "degraded",
      db: dbOk ? "connected" : "unreachable",
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
};
