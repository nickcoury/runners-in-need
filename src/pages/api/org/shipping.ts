export const prerender = false;
import type { APIRoute } from "astro";
import { schema } from "../../../db";
import { eq } from "drizzle-orm";
import { sanitize } from "../../../lib/html";
import { jsonError, requireOrganizer } from "../../../lib/api";

export const POST: APIRoute = async ({ request, locals }): Promise<Response> => {
  const auth = await requireOrganizer(locals);
  if ("error" in auth) return auth.error;
  const { user, db } = auth;
  const form = await request.formData();
  const orgId = form.get("orgId") as string;
  const shippingAddress = form.get("shippingAddress") as string;
  const shippingAttn = form.get("shippingAttn") as string;
  const showShippingAddress = form.has("showShippingAddress");

  if (orgId !== user.orgId) {
    return jsonError("Cannot update another organization", 403);
  }

  if (showShippingAddress && !shippingAddress?.trim()) {
    return jsonError("Shipping address is required when visibility is enabled", 400);
  }

  await db
    .update(schema.organizations)
    .set({
      shippingAddress: shippingAddress ? sanitize(shippingAddress) : null,
      shippingAttn: shippingAttn ? sanitize(shippingAttn) : null,
      showShippingAddress,
    })
    .where(eq(schema.organizations.id, orgId));

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
