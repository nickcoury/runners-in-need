export const prerender = false;
import type { APIRoute } from "astro";
import { schema } from "../../../db";
import { eq } from "drizzle-orm";
import { jsonError, requireOrganizer } from "../../../lib/api";

export const POST: APIRoute = async ({ request, locals }) => {
  const auth = await requireOrganizer(locals);
  if ("error" in auth) return auth.error;
  const { user, db } = auth;
  const form = await request.formData();
  const orgId = form.get("orgId") as string;
  const pledgeDriveInterest = form.get("pledgeDriveInterest") === "on";

  if (orgId !== user.orgId) {
    return jsonError("Cannot update another organization", 403);
  }

  await db
    .update(schema.organizations)
    .set({ pledgeDriveInterest })
    .where(eq(schema.organizations.id, orgId));

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
