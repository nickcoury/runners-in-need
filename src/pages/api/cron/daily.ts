export const prerender = false;

import type { APIRoute } from "astro";
import { getDb, schema } from "../../../db";
import { and, lte, inArray } from "drizzle-orm";
import { getEnv } from "../../../lib/env";
import { createActionToken } from "../../../lib/tokens";
import { expireOverdueNeeds } from "../../../lib/expire-needs";
import {
  sendNeedExpiryReminderEmail,
  sendPledgeExpiredEmail,
} from "../../../lib/email";

export const GET: APIRoute = async ({ request }) => {
  const cronSecret = getEnv("CRON_SECRET");
  if (!cronSecret) {
    return json(500, { error: "CRON_SECRET not configured" });
  }

  const provided =
    new URL(request.url).searchParams.get("token") ||
    request.headers.get("x-cron-secret");

  if (provided !== cronSecret) {
    return json(403, { error: "Forbidden" });
  }

  const results = {
    expiryReminders: 0,
    needsExpired: 0,
    pledgesExpired: 0,
  };

  try {
    await sendExpiryReminders(results);
    await expireOverdueNeeds();
    results.needsExpired = -1; // handled by shared function, count not available
    await expireStalePledges(results);
  } catch (err) {
    console.error("[cron/daily] Error:", err);
    return json(500, { error: "Internal error", partial: results });
  }

  return json(200, { ok: true, ...results });
};

// ============================================================
// 1. Send expiry reminder emails for needs
// ============================================================

async function sendExpiryReminders(results: { expiryReminders: number }) {
  const db = getDb();
  const now = new Date();

  // Get active/partially_fulfilled needs expiring within 30 days
  const oneMonthOut = new Date(now);
  oneMonthOut.setDate(oneMonthOut.getDate() + 30);

  const activeNeeds = await db.query.needs.findMany({
    where: and(
      inArray(schema.needs.status, ["active", "partially_fulfilled"]),
      lte(schema.needs.expiresAt, oneMonthOut)
    ),
    with: {
      organization: {
        with: {
          members: true,
        },
      },
    },
  });

  for (const need of activeNeeds) {
    const daysUntilExpiry = Math.floor(
      (need.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    let timeframe: "1 month" | "2 weeks" | "today" | null = null;

    // Send on specific days: 30 days, 14 days, 0 days (day-of)
    if (daysUntilExpiry === 30) {
      timeframe = "1 month";
    } else if (daysUntilExpiry === 14) {
      timeframe = "2 weeks";
    } else if (daysUntilExpiry === 0) {
      timeframe = "today";
    }

    if (!timeframe) continue;

    const token = await createActionToken(need.id);
    const orgMembers = need.organization.members;

    for (const member of orgMembers) {
      if (member.email) {
        await sendNeedExpiryReminderEmail(
          member.email,
          need.title,
          need.id,
          token,
          timeframe
        );
        results.expiryReminders++;
      }
    }
  }
}

// ============================================================
// 2. Auto-expire stale pledges (no update in 30 days)
// ============================================================

async function expireStalePledges(results: { pledgesExpired: number }) {
  const db = getDb();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Find stale pledges before updating so we can notify donors
  const stalePledges = await db.query.pledges.findMany({
    where: and(
      inArray(schema.pledges.status, ["collecting", "ready_to_deliver"]),
      lte(schema.pledges.updatedAt, thirtyDaysAgo)
    ),
    with: { need: true },
  });

  if (stalePledges.length === 0) return;

  // Batch update
  const staleIds = stalePledges.map((p) => p.id);
  await db
    .update(schema.pledges)
    .set({ status: "withdrawn", updatedAt: new Date() })
    .where(inArray(schema.pledges.id, staleIds));

  results.pledgesExpired = stalePledges.length;

  // Notify donors (fire-and-forget)
  for (const pledge of stalePledges) {
    if (pledge.donorEmail) {
      sendPledgeExpiredEmail(
        pledge.donorEmail,
        pledge.need.title,
        pledge.need.id
      );
    }
  }
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
