import type { APIRoute } from "astro";
import { getDb } from "../../db";

export const GET: APIRoute = async () => {
  let dbOk = false;
  let dbError = "";
  try {
    const db = getDb();
    await db.query.users.findFirst();
    dbOk = true;
  } catch (e: any) {
    dbError = e?.cause?.message || e?.message || String(e);
  }

  const envCheck = {
    TURSO_DATABASE_URL: !!import.meta.env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: !!import.meta.env.TURSO_AUTH_TOKEN,
    AUTH_SECRET: !!import.meta.env.AUTH_SECRET,
  };

  const status = dbOk ? 200 : 503;
  return new Response(
    JSON.stringify({
      status: dbOk ? "ok" : "degraded",
      db: dbOk ? "connected" : "unreachable",
      ...(dbError ? { dbError } : {}),
      env: envCheck,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
};
