export const prerender = false;

import type { APIRoute } from "astro";
import { getDb, schema } from "../../db";
import { eq } from "drizzle-orm";

export const GET: APIRoute = async ({ url }) => {
  const id = url.searchParams.get("id");
  if (!id) {
    return new Response(JSON.stringify({ error: "missing id param" }), { status: 400 });
  }

  const db = getDb();
  const steps: Record<string, any> = {};

  try {
    // Step 1: basic query
    const basic = await db.query.needs.findFirst({
      where: eq(schema.needs.id, id),
    });
    steps.basic = basic ? "ok" : "not found";

    if (!basic) {
      return new Response(JSON.stringify(steps), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 2: with org
    const withOrg = await db.query.needs.findFirst({
      where: eq(schema.needs.id, id),
      with: { organization: true },
    });
    steps.withOrg = withOrg?.organization ? "ok" : "missing org";

    // Step 3: with pledges
    const withPledges = await db.query.needs.findFirst({
      where: eq(schema.needs.id, id),
      with: { pledges: true },
    });
    steps.withPledges = `ok (${withPledges?.pledges?.length ?? 0} pledges)`;

    // Step 4: with pledges + messages
    const withMessages = await db.query.needs.findFirst({
      where: eq(schema.needs.id, id),
      with: {
        pledges: {
          with: { messages: true },
        },
      },
    });
    steps.withMessages = "ok";

    // Step 5: with pledges + messages + sender
    const withSender = await db.query.needs.findFirst({
      where: eq(schema.needs.id, id),
      with: {
        pledges: {
          with: {
            messages: {
              with: { sender: true },
            },
          },
        },
      },
    });
    steps.withSender = "ok";

    // Step 6: with continuedFrom
    const withContinued = await db.query.needs.findFirst({
      where: eq(schema.needs.id, id),
      with: { continuedFrom: true },
    });
    steps.withContinuedFrom = "ok";

    // Step 7: full query (same as [id].astro)
    const full = await db.query.needs.findFirst({
      where: eq(schema.needs.id, id),
      with: {
        organization: true,
        pledges: {
          with: {
            messages: {
              with: { sender: true },
            },
          },
        },
        continuedFrom: true,
      },
    });
    steps.fullQuery = "ok";
  } catch (e: any) {
    steps.error = e?.message || String(e);
    steps.stack = e?.stack?.split("\n").slice(0, 5);
  }

  return new Response(JSON.stringify(steps, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
};
