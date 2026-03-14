export const prerender = false;
import type { APIRoute } from "astro";
import { getDb, schema } from "../../db";
import { eq, and } from "drizzle-orm";
import { createId } from "../../lib/id";
import { sendPledgeReceivedEmail } from "../../lib/email";
import { getEnv } from "../../lib/env";
import { sanitize } from "../../lib/html";
import { jsonError } from "../../lib/api";

export const POST: APIRoute = async ({ request, locals }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Invalid form data", 400);
  }
  // Honeypot check — if filled, it's a bot
  const honeypot = form.get("website") as string | null;
  if (honeypot) {
    return new Response(JSON.stringify({ id: "ok" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }

  const needId = form.get("needId") as string;
  const donorEmail = form.get("donorEmail") as string;
  const donorName = form.get("donorName") as string | null;
  const description = form.get("description") as string;

  if (!needId || !donorEmail || !description) {
    return jsonError("Missing required fields", 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
    return jsonError("Invalid email format", 400);
  }

  if (description.trim().length < 5 || description.trim().length > 2000) {
    return jsonError("Description must be between 5 and 2000 characters", 400);
  }

  const session = locals.session;
  const isAuthenticated = !!session?.user?.id;

  // Skip Turnstile for authenticated users — they proved they're human by signing in
  if (!isAuthenticated) {
    const turnstileSecret = getEnv("TURNSTILE_SECRET_KEY");
    const turnstileToken = form.get("cf-turnstile-response") as string | null;
    if (turnstileSecret) {
      if (!turnstileToken) {
        return jsonError("Verification required", 403);
      }
      const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: turnstileSecret, response: turnstileToken }),
      });
      const result = (await res.json()) as { success: boolean };
      if (!result.success) {
        return jsonError("Verification failed", 403);
      }
    }
  }

  try {
    const db = getDb();
    const need = await db.query.needs.findFirst({
      where: eq(schema.needs.id, needId),
    });

    if (!need) {
      return jsonError("Need not found", 404);
    }

    if (need.status !== "active" && need.status !== "partially_fulfilled") {
      return jsonError("This need is no longer accepting pledges", 400);
    }

    const donorId = session?.user?.id ?? null;

    const pledge = {
      id: createId(),
      needId,
      donorId,
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
      ).catch((err) => console.error("[email] pledge received notification failed:", err));
    }

    return new Response(JSON.stringify({ id: pledge.id }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Pledge creation failed:", e);
    return jsonError("Internal server error", 500);
  }
};
