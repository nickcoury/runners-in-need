import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { getDb, schema } from "../db";
import { createId } from "../lib/id";
import { eq, and } from "drizzle-orm";
import { sendPledgeStatusEmail } from "../lib/email";
import { generateRemainingNeedText } from "../lib/llm";
import { sanitize } from "../lib/html";

export const server = {
  updatePledgeStatus: defineAction({
    accept: "form",
    input: z.object({
      pledgeId: z.string(),
      status: z.enum([
        "collecting",
        "ready_to_deliver",
        "delivered",
        "withdrawn",
      ]),
    }),
    handler: async (input, ctx) => {
      const userId = ctx.locals.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const db = getDb();

      const pledge = await db.query.pledges.findFirst({
        where: eq(schema.pledges.id, input.pledgeId),
        with: { need: true },
      });
      if (!pledge) throw new Error("Pledge not found");

      if (pledge.need.status === "fulfilled" || pledge.need.status === "expired") {
        throw new Error("This need is no longer active");
      }

      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, userId),
      });
      if (!user) throw new Error("User not found");

      const isDonor = pledge.donorId === user.id;
      const isOrgMember = user.orgId === pledge.need.orgId;
      if (!isDonor && !isOrgMember) {
        throw new Error("You do not have permission to update this pledge");
      }

      await db
        .update(schema.pledges)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(schema.pledges.id, input.pledgeId));

      // Notify donor about status change (fire-and-forget)
      if (pledge.donorEmail) {
        sendPledgeStatusEmail(
          pledge.donorEmail,
          pledge.need.title,
          pledge.need.id,
          input.status
        ).catch((err) => console.error("[email] pledge status notification failed:", err));
      }

      // On delivery, check if need is partially fulfilled and generate suggested text
      if (input.status === "delivered") {
        const allPledges = await db.query.pledges.findMany({
          where: eq(schema.pledges.needId, pledge.needId),
        });

        const deliveredPledges = allPledges.filter(
          (p) => p.id === input.pledgeId || p.status === "delivered"
        );
        const activePledges = allPledges.filter(
          (p) =>
            p.id !== input.pledgeId &&
            (p.status === "collecting" || p.status === "ready_to_deliver")
        );

        const allResolved = activePledges.length === 0;

        if (allResolved && deliveredPledges.length === allPledges.length) {
          // All pledges delivered — record timestamp, start 60-day fulfillment window
          await db
            .update(schema.needs)
            .set({ allDeliveredAt: new Date(), updatedAt: new Date() })
            .where(eq(schema.needs.id, pledge.needId));
        } else {
          // Partially fulfilled — generate suggested remaining text
          const deliveredDescriptions = deliveredPledges.map(
            (p) => p.description
          );

          const suggestedText = await generateRemainingNeedText(
            pledge.need.body,
            deliveredDescriptions
          );

          await db
            .update(schema.needs)
            .set({
              status: "partially_fulfilled",
              suggestedText,
              updatedAt: new Date(),
            })
            .where(eq(schema.needs.id, pledge.needId));
        }
      }

      // If a pledge was delivered and is now changing away from delivered, clear allDeliveredAt
      if (
        pledge.status === "delivered" &&
        input.status !== "delivered" &&
        pledge.need.allDeliveredAt
      ) {
        await db
          .update(schema.needs)
          .set({ allDeliveredAt: null, updatedAt: new Date() })
          .where(eq(schema.needs.id, pledge.needId));
      }

      return { success: true };
    },
  }),

  submitOrganizerRequest: defineAction({
    accept: "form",
    input: z.object({
      orgName: z.string().min(2).max(200),
      orgDescription: z.string().min(10).max(2000),
      orgUrl: z.string().url().optional(),
      website: z.string().optional(),
    }),
    handler: async (input, ctx) => {
      const userId = ctx.locals.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      // Honeypot check — if filled, it's a bot; return fake success
      if (input.website) {
        return { id: "ok" };
      }

      const db = getDb();

      // Prevent duplicate pending requests from the same user
      const existing = await db.query.organizerRequests.findFirst({
        where: and(
          eq(schema.organizerRequests.userId, userId),
          eq(schema.organizerRequests.status, "pending")
        ),
      });
      if (existing) {
        throw new Error("You already have a pending organizer request");
      }

      const request = {
        id: createId(),
        userId,
        orgName: sanitize(input.orgName),
        orgDescription: sanitize(input.orgDescription),
        orgUrl: input.orgUrl,
        status: "pending" as const,
      };

      await db.insert(schema.organizerRequests).values(request);
      return { id: request.id };
    },
  }),
};
