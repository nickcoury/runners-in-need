import { getDb, schema } from "../db";
import { and, inArray, lte } from "drizzle-orm";

/**
 * Expire needs that have passed their expiresAt date.
 * Called by the daily cron job (/api/cron/daily).
 */
export async function expireOverdueNeeds() {
  try {
    const db = getDb();
    const now = new Date();

    await db
      .update(schema.needs)
      .set({ status: "expired", updatedAt: now })
      .where(
        and(
          inArray(schema.needs.status, ["active", "partially_fulfilled"]),
          lte(schema.needs.expiresAt, now)
        )
      );
  } catch (e) {
    console.error("expireOverdueNeeds failed:", e);
  }
}
