export const prerender = false;
import type { APIRoute } from "astro";
import { getDb, schema } from "../../../db";
import { eq } from "drizzle-orm";
import { sendOrganizerDeniedEmail } from "../../../lib/email";
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

  // Fetch request before updating so we can notify the applicant
  const orgRequest = await db.query.organizerRequests.findFirst({
    where: eq(schema.organizerRequests.id, requestId),
  });

  await db
    .update(schema.organizerRequests)
    .set({ status: "denied", reviewedAt: new Date(), reviewedBy: session.user.id })
    .where(eq(schema.organizerRequests.id, requestId));

  // Notify applicant (fire-and-forget)
  if (orgRequest) {
    const applicant = await db.query.users.findFirst({
      where: eq(schema.users.id, orgRequest.userId),
      columns: { email: true },
    });
    if (applicant) {
      sendOrganizerDeniedEmail(applicant.email, orgRequest.orgName)
        .catch((err) => console.error("[email] organizer denied notification failed:", err));
    }
  }

  return redirect("/admin/requests");
};
