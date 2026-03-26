export const prerender = false;
import type { APIRoute } from "astro";
import { getDb, schema } from "../../db";
import { createId } from "../../lib/id";
import { sanitize } from "../../lib/html";
import { jsonError, requireAuth } from "../../lib/api";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const session = requireAuth(locals);
  if (!session) return jsonError("Unauthorized", 401);
  const form = await request.formData();
  const organizerName = form.get("organizerName") as string;
  const organizerEmail = form.get("organizerEmail") as string;
  const groupName = form.get("groupName") as string;
  const eventName = form.get("eventName") as string;
  const eventDateStr = form.get("eventDate") as string;
  const eventLocation = form.get("eventLocation") as string;
  const estimatedAttendeesStr = form.get("estimatedAttendees") as string;
  const description = form.get("description") as string;

  // Validate required fields
  if (!organizerName || !organizerEmail || !groupName || !eventName || !eventDateStr || !eventLocation || !description) {
    return jsonError("Missing required fields", 400);
  }

  if (organizerName.length < 2 || organizerName.length > 200) {
    return jsonError("Organizer name must be 2-200 characters", 400);
  }
  if (groupName.length < 2 || groupName.length > 200) {
    return jsonError("Group name must be 2-200 characters", 400);
  }
  if (eventName.length < 2 || eventName.length > 200) {
    return jsonError("Event name must be 2-200 characters", 400);
  }
  if (description.length < 10 || description.length > 2000) {
    return jsonError("Description must be 10-2000 characters", 400);
  }

  if (eventLocation.length < 2 || eventLocation.length > 500) {
    return jsonError("Event location must be 2-500 characters", 400);
  }

  const eventDate = new Date(eventDateStr);
  if (isNaN(eventDate.getTime())) {
    return jsonError("Invalid event date", 400);
  }
  if (eventDate.getTime() <= Date.now()) {
    return jsonError("Event date must be in the future", 400);
  }

  const estimatedAttendees = estimatedAttendeesStr ? parseInt(estimatedAttendeesStr, 10) : null;
  if (estimatedAttendees !== null && (isNaN(estimatedAttendees) || estimatedAttendees < 1)) {
    return jsonError("Invalid estimated attendees", 400);
  }

  try {
    const db = getDb();
    const driveId = createId();

    await db.insert(schema.pledgeDrives).values({
      id: driveId,
      organizerUserId: session.user.id,
      organizerName: sanitize(organizerName),
      organizerEmail: sanitize(organizerEmail),
      groupName: sanitize(groupName),
      eventName: sanitize(eventName),
      eventDate,
      eventLocation: sanitize(eventLocation),
      estimatedAttendees,
      description: sanitize(description),
      status: "planned",
    });

    return redirect("/drives?success=true");
  } catch (e) {
    console.error("Drive creation failed:", e);
    return jsonError("Internal server error", 500);
  }
};
