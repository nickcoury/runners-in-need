import type { APIRoute } from "astro";
import { getDb, schema } from "../../db";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { sendPledgeReceivedEmail } from "../../lib/email";

function sanitize(s: string): string {
  return s.trim().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const needId = form.get("needId") as string;
  const donorEmail = form.get("donorEmail") as string;
  const donorName = form.get("donorName") as string | null;
  const description = form.get("description") as string;

  if (!needId || !donorEmail || !description) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Verify Turnstile if configured
  const turnstileSecret = import.meta.env.TURNSTILE_SECRET_KEY;
  const turnstileToken = form.get("cf-turnstile-response") as string | null;
  if (turnstileSecret) {
    if (!turnstileToken) {
      return new Response(JSON.stringify({ error: "Verification required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: turnstileSecret, response: turnstileToken }),
    });
    const result = (await res.json()) as { success: boolean };
    if (!result.success) {
      return new Response(JSON.stringify({ error: "Verification failed" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const db = getDb();
  const need = await db.query.needs.findFirst({
    where: eq(schema.needs.id, needId),
  });

  if (!need) {
    return new Response(JSON.stringify({ error: "Need not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (need.status !== "active" && need.status !== "partially_fulfilled") {
    return new Response(JSON.stringify({ error: "This need is no longer accepting pledges" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const pledge = {
    id: nanoid(),
    needId,
    donorEmail: donorEmail.trim(),
    donorName: donorName ? sanitize(donorName) : undefined,
    description: sanitize(description),
    status: "collecting" as const,
  };

  await db.insert(schema.pledges).values(pledge);

  // Notify org members about the new pledge (fire-and-forget)
  const orgMembers = await db.query.users.findMany({
    where: and(
      eq(schema.users.orgId, need.orgId),
      eq(schema.users.role, "organizer")
    ),
  });
  for (const member of orgMembers) {
    sendPledgeReceivedEmail(
      member.email,
      need.title,
      need.id,
      pledge.donorName ?? null,
      pledge.description
    );
  }

  return new Response(JSON.stringify({ id: pledge.id }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
