export const prerender = false;
import type { APIRoute } from "astro";
import { getDb, schema } from "../../../db";
import { eq } from "drizzle-orm";
import { createId } from "../../../lib/id";
import { sendOrganizerApprovedEmail } from "../../../lib/email";
import { jsonError } from "../../../lib/api";

export const POST: APIRoute = async ({ request, redirect, locals }) => {
  // Defense-in-depth: verify admin role at handler level
  const session = locals.session;
  if (!session?.user || session.user.role !== "admin") {
    return jsonError("Forbidden", 403);
  }

  const form = await request.formData();
  const requestId = form.get("requestId") as string;
  if (!requestId) return jsonError("Missing requestId", 400);

  const db = getDb();
  const orgRequest = await db.query.organizerRequests.findFirst({
    where: eq(schema.organizerRequests.id, requestId),
  });

  if (!orgRequest || orgRequest.status !== "pending") {
    return redirect("/admin/requests");
  }

  // Create the organization
  const orgId = createId();
  await db.insert(schema.organizations).values({
    id: orgId,
    name: orgRequest.orgName,
    description: orgRequest.orgDescription,
    location: "TBD",
    verified: true,
  });

  // Update user to organizer role with org
  await db
    .update(schema.users)
    .set({ role: "organizer", orgId })
    .where(eq(schema.users.id, orgRequest.userId));

  // Mark request as approved
  await db
    .update(schema.organizerRequests)
    .set({ status: "approved", reviewedAt: new Date() })
    .where(eq(schema.organizerRequests.id, requestId));

  // Notify applicant (fire-and-forget)
  const applicant = await db.query.users.findFirst({
    where: eq(schema.users.id, orgRequest.userId),
    columns: { email: true },
  });
  if (applicant) {
    sendOrganizerApprovedEmail(applicant.email, orgRequest.orgName);
  }

  return redirect("/admin/requests");
};
