export const prerender = false;
import type { APIRoute } from "astro";
import { getDb, schema } from "../../db";
import { eq, inArray, desc } from "drizzle-orm";
import { createId } from "../../lib/id";
import { sanitize } from "../../lib/html";
import { jsonError, requireOrganizer } from "../../lib/api";
import { VALID_CATEGORIES, VALID_DELIVERY_METHODS } from "../../lib/constants";

export const GET: APIRoute = async () => {
  const db = getDb();
  const needsWithOrg = await db.query.needs.findMany({
    where: inArray(schema.needs.status, ["active", "partially_fulfilled"]),
    with: {
      organization: { columns: { name: true } },
      pledges: { columns: { id: true } },
    },
    orderBy: [desc(schema.needs.createdAt)],
  });

  const allNeeds = needsWithOrg.map((n) => ({
    id: n.id,
    orgId: n.orgId,
    title: n.title,
    categoryTag: n.categoryTag,
    body: n.body,
    orgName: n.organization?.name ?? "Unknown Organization",
    location: n.location,
    lat: n.latitude,
    lng: n.longitude,
    extrasWelcome: n.extrasWelcome,
    expiresAt: n.expiresAt.toISOString(),
    pledgeCount: n.pledges.length,
  }));

  return new Response(JSON.stringify(allNeeds), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60",
    },
  });
};

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const auth = await requireOrganizer(locals);
  if ("error" in auth) return auth.error;
  const { user, db } = auth;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Invalid form data", 400);
  }
  const orgId = form.get("orgId") as string;
  const categoryTag = form.get("categoryTag") as string;
  const title = form.get("title") as string;
  const body = form.get("body") as string;
  const extrasWelcome = form.get("extrasWelcome") === "on";
  const expiresInDays = parseInt(form.get("expiresInDays") as string, 10) || 90;
  const continuedFromId = form.get("continuedFromId") as string | null;
  const deliveryMethodsRaw = form.getAll("deliveryMethods") as string[];
  const deliveryInstructions = form.get("deliveryInstructions") as string | null;

  // Validate
  if (!orgId || !title || !body) {
    return jsonError("Missing required fields", 400);
  }
  if (orgId !== user.orgId) {
    return jsonError("Cannot post for another organization", 403);
  }
  if (!(VALID_CATEGORIES as readonly string[]).includes(categoryTag)) {
    return jsonError("Invalid category", 400);
  }
  if (title.length < 5 || title.length > 200) {
    return jsonError("Title must be 5-200 characters", 400);
  }
  if (body.length < 10 || body.length > 5000) {
    return jsonError("Description must be 10-5000 characters", 400);
  }
  if (expiresInDays < 7 || expiresInDays > 180) {
    return jsonError("Invalid expiration", 400);
  }

  try {
    const org = await db.query.organizations.findFirst({
      where: eq(schema.organizations.id, orgId),
    });
    if (!org) {
      return jsonError("Organization not found", 404);
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Validate delivery methods
    const deliveryMethods = deliveryMethodsRaw.filter((m) =>
      (VALID_DELIVERY_METHODS as readonly string[]).includes(m)
    );

    const needId = createId();
    await db.insert(schema.needs).values({
      id: needId,
      orgId,
      categoryTag,
      title: sanitize(title),
      body: sanitize(body),
      extrasWelcome,
      location: org.location,
      latitude: org.latitude,
      longitude: org.longitude,
      status: "active",
      continuedFromId: continuedFromId || undefined,
      deliveryMethods: deliveryMethods.length > 0 ? JSON.stringify(deliveryMethods) : null,
      deliveryInstructions: deliveryInstructions ? sanitize(deliveryInstructions) : null,
      expiresAt,
    });

    return redirect(`/needs/${needId}`);
  } catch (e) {
    console.error("Need creation failed:", e);
    return jsonError("Internal server error", 500);
  }
};
