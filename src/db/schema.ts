import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
  index,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ============================================================
// Users
// ============================================================

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  role: text("role", { enum: ["donor", "organizer", "admin"] })
    .notNull()
    .default("donor"),
  orgId: text("org_id").references(() => organizations.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
  pledges: many(pledges),
  messages: many(messages),
}));

// ============================================================
// Organizations
// ============================================================

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  location: text("location").notNull(), // City, State (public)
  latitude: real("latitude"),
  longitude: real("longitude"),
  shippingAddress: text("shipping_address"), // Full address (opt-in, private)
  shippingAttn: text("shipping_attn"), // "Attn: Coach Smith"
  showShippingAddress: integer("show_shipping_address", { mode: "boolean" })
    .notNull()
    .default(false),
  deliveryMethods: text("delivery_methods").notNull().default('["shipping"]'), // JSON array: ["shipping","drop_off","meetup","other"]
  deliveryInstructions: text("delivery_instructions"), // Free-form text
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  pledgeDriveInterest: integer("pledge_drive_interest", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(users),
  needs: many(needs),
}));

// ============================================================
// Organizer Requests (approval queue)
// ============================================================

export const organizerRequests = sqliteTable("organizer_requests", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  orgName: text("org_name").notNull(),
  orgDescription: text("org_description").notNull(),
  orgUrl: text("org_url"), // Public link proving association
  status: text("status", { enum: ["pending", "approved", "denied"] })
    .notNull()
    .default("pending"),
  reviewedBy: text("reviewed_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
}, (table) => [
  index("idx_organizer_requests_user_id").on(table.userId),
]);

// ============================================================
// Needs
// ============================================================

export const needs = sqliteTable("needs", {
  id: text("id").primaryKey(),
  orgId: text("org_id")
    .notNull()
    .references(() => organizations.id),
  categoryTag: text("category_tag", {
    enum: ["shoes", "apparel", "accessories", "other"],
  }).notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(), // Free-form text (template-assisted)
  extrasWelcome: integer("extras_welcome", { mode: "boolean" })
    .notNull()
    .default(false),
  location: text("location").notNull(), // Inherited from org, can override
  latitude: real("latitude"),
  longitude: real("longitude"),
  status: text("status", {
    enum: ["active", "partially_fulfilled", "fulfilled", "expired"],
  })
    .notNull()
    .default("active"),
  suggestedText: text("suggested_text"), // LLM-generated remaining need text for organizer review
  continuedFromId: text("continued_from_id").unique().references((): any => needs.id),
  deliveryMethods: text("delivery_methods"), // JSON array override, null = use org defaults
  deliveryInstructions: text("delivery_instructions"), // Per-need override, null = use org defaults
  allDeliveredAt: integer("all_delivered_at", { mode: "timestamp" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
}, (table) => [
  index("idx_needs_status").on(table.status),
  index("idx_needs_org_id").on(table.orgId),
]);

export const needsRelations = relations(needs, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [needs.orgId],
    references: [organizations.id],
  }),
  continuedFrom: one(needs, {
    fields: [needs.continuedFromId],
    references: [needs.id],
    relationName: "needChain",
  }),
  pledges: many(pledges),
}));

// ============================================================
// Pledges (donor commitments)
// ============================================================

export const pledges = sqliteTable("pledges", {
  id: text("id").primaryKey(),
  needId: text("need_id")
    .notNull()
    .references(() => needs.id),
  donorId: text("donor_id").references(() => users.id), // Nullable for anonymous
  donorEmail: text("donor_email").notNull(), // Always required for contact
  donorName: text("donor_name"),
  description: text("description").notNull(), // What they're bringing
  status: text("status", {
    enum: ["collecting", "ready_to_deliver", "delivered", "withdrawn"],
  })
    .notNull()
    .default("collecting"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
}, (table) => [
  index("idx_pledges_need_id").on(table.needId),
  index("idx_pledges_donor_id").on(table.donorId),
]);

export const pledgesRelations = relations(pledges, ({ one, many }) => ({
  need: one(needs, {
    fields: [pledges.needId],
    references: [needs.id],
  }),
  donor: one(users, {
    fields: [pledges.donorId],
    references: [users.id],
  }),
  messages: many(messages),
}));

// ============================================================
// Messages (per-pledge threads)
// ============================================================

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  pledgeId: text("pledge_id")
    .notNull()
    .references(() => pledges.id),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id),
  body: text("body").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
}, (table) => [
  index("idx_messages_pledge_id").on(table.pledgeId),
]);

export const messagesRelations = relations(messages, ({ one }) => ({
  pledge: one(pledges, {
    fields: [messages.pledgeId],
    references: [pledges.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// ============================================================
// Pledge Drives (gear collection events)
// ============================================================

export const pledgeDrives = sqliteTable("pledge_drives", {
  id: text("id").primaryKey(),
  organizerUserId: text("organizer_user_id")
    .notNull()
    .references(() => users.id),
  organizerName: text("organizer_name").notNull(),
  organizerEmail: text("organizer_email").notNull(),
  groupName: text("group_name").notNull(),
  eventName: text("event_name").notNull(),
  eventDate: integer("event_date", { mode: "timestamp" }).notNull(),
  eventLocation: text("event_location").notNull(),
  estimatedAttendees: integer("estimated_attendees"),
  description: text("description").notNull(),
  status: text("status", {
    enum: ["planned", "active", "completed", "cancelled"],
  })
    .notNull()
    .default("planned"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const pledgeDrivesRelations = relations(pledgeDrives, ({ one }) => ({
  organizer: one(users, {
    fields: [pledgeDrives.organizerUserId],
    references: [users.id],
  }),
}));

// ============================================================
// Auth.js tables (required by @auth/drizzle-adapter)
// ============================================================

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compositePk: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (vt) => ({
    compositePk: primaryKey({
      columns: [vt.identifier, vt.token],
    }),
  })
);
