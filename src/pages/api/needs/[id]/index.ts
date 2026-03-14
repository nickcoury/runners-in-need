export const prerender = false;

import type { APIRoute } from "astro";
import { schema } from "../../../../db";
import { eq } from "drizzle-orm";
import { sanitize } from "../../../../lib/html";
import { jsonError, requireOrganizer } from "../../../../lib/api";
import { VALID_CATEGORIES, VALID_DELIVERY_METHODS } from "../../../../lib/constants";

// Also handle POST (HTML forms can't send PUT)
export const POST: APIRoute = async (context) => {
  return PUT(context);
};

export const PUT: APIRoute = async ({ params, request, locals, redirect }) => {
  const auth = await requireOrganizer(locals);
  if ("error" in auth) return auth.error;
  const { user, db } = auth;

  // Load the need
  const need = await db.query.needs.findFirst({
    where: eq(schema.needs.id, params.id!),
  });
  if (!need) {
    return jsonError("Need not found", 404);
  }
  if (need.orgId !== user.orgId) {
    return jsonError("Cannot update another organization's need", 403);
  }

  const form = await request.formData();
  const title = form.get("title") as string;
  const body = form.get("body") as string;
  const categoryTag = form.get("categoryTag") as string;
  const extrasWelcome = form.get("extrasWelcome") === "on";
  const expiresInDays = parseInt(form.get("expiresInDays") as string, 10) || 90;
  const deliveryMethodsRaw = form.getAll("deliveryMethods") as string[];
  const deliveryInstructions = form.get("deliveryInstructions") as string | null;

  // Validate
  if (!title || !body) {
    return jsonError("Missing required fields", 400);
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

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const deliveryMethods = deliveryMethodsRaw.filter((m) =>
    (VALID_DELIVERY_METHODS as readonly string[]).includes(m)
  );

  await db
    .update(schema.needs)
    .set({
      title: sanitize(title),
      body: sanitize(body),
      categoryTag,
      extrasWelcome,
      expiresAt,
      deliveryMethods: deliveryMethods.length > 0 ? JSON.stringify(deliveryMethods) : null,
      deliveryInstructions: deliveryInstructions ? sanitize(deliveryInstructions) : null,
      updatedAt: new Date(),
    })
    .where(eq(schema.needs.id, params.id!));

  return redirect(`/needs/${params.id}`);
};

export const DELETE: APIRoute = async ({ params, locals, redirect }) => {
  const auth = await requireOrganizer(locals);
  if ("error" in auth) return auth.error;
  const { user, db } = auth;

  // Load the need
  const need = await db.query.needs.findFirst({
    where: eq(schema.needs.id, params.id!),
  });
  if (!need) {
    return jsonError("Need not found", 404);
  }
  if (need.orgId !== user.orgId) {
    return jsonError("Cannot delete another organization's need", 403);
  }

  // Soft-delete by setting status to expired
  await db
    .update(schema.needs)
    .set({
      status: "expired",
      updatedAt: new Date(),
    })
    .where(eq(schema.needs.id, params.id!));

  return redirect("/dashboard");
};
