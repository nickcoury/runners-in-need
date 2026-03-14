export const prerender = false;

import type { APIRoute } from "astro";
import { getDb, schema } from "../../../db";
import { and, eq, lte, inArray, isNotNull } from "drizzle-orm";
import { getEnv } from "../../../lib/env";
import { createActionToken } from "../../../lib/tokens";
import { expireOverdueNeeds } from "../../../lib/expire-needs";
import {
  sendNeedExpiryReminderEmail,
  sendPledgeExpiredEmail,
  sendFulfillmentReminderEmail,
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
    fulfillmentReminders: 0,
    needsAutoFulfilled: 0,
  };

  try {
    await sendExpiryReminders(results);
    await expireOverdueNeeds();
    results.needsExpired = -1; // handled by shared function, count not available
    await expireStalePledges(results);
    await processFulfillmentReminders(results);
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

    const emailPromises = orgMembers
      .filter((member) => member.email)
      .map((member) =>
        sendNeedExpiryReminderEmail(
          member.email!,
          need.title,
          need.id,
          token,
          timeframe!
        )
      );
    const settled = await Promise.allSettled(emailPromises);
    results.expiryReminders += settled.filter((r) => r.status === "fulfilled").length;
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

// ============================================================
// 3. Fulfillment reminders & auto-close for all-delivered needs
// ============================================================

async function processFulfillmentReminders(results: {
  fulfillmentReminders: number;
  needsAutoFulfilled: number;
}) {
  const db = getDb();
  const now = new Date();

  // Find needs where allDeliveredAt is set and status is still active
  const candidates = await db.query.needs.findMany({
    where: and(
      isNotNull(schema.needs.allDeliveredAt),
      inArray(schema.needs.status, ["active"])
    ),
    with: {
      organization: {
        with: {
          members: true,
        },
      },
    },
  });

  for (const need of candidates) {
    if (!need.allDeliveredAt) continue;

    const daysSinceDelivered = Math.floor(
      (now.getTime() - need.allDeliveredAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceDelivered >= 60) {
      // Auto-close as fulfilled
      await db
        .update(schema.needs)
        .set({ status: "fulfilled", updatedAt: new Date() })
        .where(eq(schema.needs.id, need.id));
      results.needsAutoFulfilled++;
      continue;
    }

    // Send reminder on the exact day of each milestone (30, 45, 55 days)
    if (
      daysSinceDelivered === 30 ||
      daysSinceDelivered === 45 ||
      daysSinceDelivered === 55
    ) {
      const daysRemaining = 60 - daysSinceDelivered;
      const token = await createActionToken(need.id);
      const orgMembers = need.organization.members;

      const emailPromises = orgMembers
        .filter((member) => member.email)
        .map((member) =>
          sendFulfillmentReminderEmail(
            member.email!,
            need.title,
            need.id,
            token,
            daysRemaining
          )
        );
      const settled = await Promise.allSettled(emailPromises);
      results.fulfillmentReminders += settled.filter((r) => r.status === "fulfilled").length;
    }
  }
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
