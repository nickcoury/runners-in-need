import type { APIRoute } from "astro";
import { getDb, schema } from "../../db";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const session = (locals as any).session;
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const form = await request.formData();
  const pledgeId = form.get("pledgeId") as string;
  const body = (form.get("body") as string)?.trim();

  if (!pledgeId || !body || body.length < 1 || body.length > 2000) {
    return new Response("Invalid input", { status: 400 });
  }

  const db = getDb();

  // Verify pledge exists
  const pledge = await db.query.pledges.findFirst({
    where: eq(schema.pledges.id, pledgeId),
    with: { need: true },
  });
  if (!pledge) {
    return new Response("Pledge not found", { status: 404 });
  }

  // Verify sender is either the donor or an org member
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, session.user.id),
  });
  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  const isDonor = pledge.donorId === user.id;
  const isOrgMember = user.orgId === pledge.need.orgId;
  if (!isDonor && !isOrgMember) {
    return new Response("Forbidden", { status: 403 });
  }

  // Sanitize body
  const sanitized = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  await db.insert(schema.messages).values({
    id: nanoid(),
    pledgeId,
    senderId: user.id,
    body: sanitized,
  });

  // If form submission (has Referer), redirect back to need page
  const referer = request.headers.get("Referer");
  if (referer) {
    return redirect(new URL(referer).pathname);
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
