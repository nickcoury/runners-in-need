/**
 * Create test users with valid DB sessions for Playwright usability testing.
 *
 * Run: npx tsx scripts/create-test-users.ts
 *
 * Outputs session tokens that can be set as cookies to authenticate
 * as each user type in Playwright tests.
 */

import { config } from "dotenv";
config();

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema.ts";
import { createId } from "../src/lib/id.ts";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client, { schema });

// Sessions expire 30 days from now
const SESSION_EXPIRY = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

const TEST_USERS = [
  {
    id: createId(),
    email: "test-donor@example.com",
    name: "Test Donor",
    role: "donor" as const,
    needsOrg: false,
  },
  {
    id: createId(),
    email: "test-organizer@example.com",
    name: "Coach Maria",
    role: "organizer" as const,
    needsOrg: true,
  },
  {
    id: createId(),
    email: "test-admin@example.com",
    name: "Admin User",
    role: "admin" as const,
    needsOrg: false,
  },
] as const;

async function createTestUsers() {
  console.log("Creating test users for Playwright...\n");

  // Create org for the organizer
  const orgId = createId();
  const existingOrg = await db
    .select()
    .from(schema.organizations)
    .where(eq(schema.organizations.name, "Test Org — Coach Maria"))
    .limit(1);

  const orgExists = existingOrg.length > 0;
  const finalOrgId = orgExists ? existingOrg[0].id : orgId;

  if (!orgExists) {
    await db.insert(schema.organizations).values({
      id: orgId,
      name: "Test Org — Coach Maria",
      description: "Test organization for Playwright usability audit.",
      location: "Test City, TS",
      verified: true,
      showShippingAddress: false,
    });
    console.log(`Created organization: Test Org — Coach Maria (${orgId})`);
  } else {
    console.log(`Organization already exists: ${finalOrgId}`);
  }

  const results: { role: string; email: string; sessionToken: string }[] = [];

  for (const testUser of TEST_USERS) {
    // Upsert user: delete existing, then insert fresh
    await db.delete(schema.sessions).where(
      eq(schema.sessions.userId, testUser.id)
    );

    // Check if user already exists by email
    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, testUser.email))
      .limit(1);

    let userId: string;

    if (existing.length > 0) {
      userId = existing[0].id;
      // Clean up old sessions for this user
      await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
      // Update the user in case role/name changed
      await db
        .update(schema.users)
        .set({
          name: testUser.name,
          role: testUser.role,
          orgId: testUser.needsOrg ? finalOrgId : null,
        })
        .where(eq(schema.users.id, userId));
      console.log(`Updated existing user: ${testUser.email} (${userId})`);
    } else {
      userId = testUser.id;
      await db.insert(schema.users).values({
        id: userId,
        email: testUser.email,
        name: testUser.name,
        role: testUser.role,
        orgId: testUser.needsOrg ? finalOrgId : undefined,
      });
      console.log(`Created user: ${testUser.email} (${userId})`);
    }

    // Create a session token
    const sessionToken = crypto.randomUUID().replace(/-/g, "");
    await db.insert(schema.sessions).values({
      sessionToken,
      userId,
      expires: SESSION_EXPIRY,
    });

    results.push({ role: testUser.role, email: testUser.email, sessionToken });
  }

  console.log("\n========================================");
  console.log("Session tokens (set as authjs.session-token cookie):");
  console.log("========================================\n");

  for (const r of results) {
    console.log(`${r.role.toUpperCase()} (${r.email}):`);
    console.log(`  ${r.sessionToken}\n`);
  }

  console.log("Cookie name: authjs.session-token (dev) or __Secure-authjs.session-token (prod)");
  console.log(`Sessions expire: ${SESSION_EXPIRY.toISOString()}`);
}

createTestUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to create test users:", err);
    process.exit(1);
  });
