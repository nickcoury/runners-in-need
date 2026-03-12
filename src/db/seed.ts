/**
 * Seed script for dev/test database.
 * Run: npm run db:seed
 *
 * Populates the database with realistic sample data across all tables.
 * Safe to run multiple times — clears existing data first.
 */

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { nanoid } from "nanoid";
import * as schema from "./schema.ts";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client, { schema });

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function seed() {
  console.log("Clearing existing data...");
  await db.delete(schema.messages);
  await db.delete(schema.pledges);
  await db.delete(schema.organizerRequests);
  await db.delete(schema.needs);
  await db.delete(schema.users);
  await db.delete(schema.organizations);

  console.log("Seeding organizations...");
  const orgs = [
    {
      id: nanoid(),
      name: "Portland Running Project",
      description: "Providing running gear and coaching to houseless individuals in Portland. We believe running is for everyone.",
      location: "Portland, OR",
      latitude: 45.5152,
      longitude: -122.6784,
      shippingAddress: "123 SE Hawthorne Blvd, Portland, OR 97214",
      shippingAttn: "Attn: Coach Martinez",
      showShippingAddress: true,
      verified: true,
    },
    {
      id: nanoid(),
      name: "Back on My Feet Chicago",
      description: "Combat homelessness through the power of running. Our members train together 3x/week and work toward employment goals.",
      location: "Chicago, IL",
      latitude: 41.8781,
      longitude: -87.6298,
      shippingAddress: "456 N Michigan Ave, Chicago, IL 60611",
      shippingAttn: "Attn: Program Director",
      showShippingAddress: true,
      verified: true,
    },
    {
      id: nanoid(),
      name: "Soles4Souls Running",
      description: "Getting shoes on feet that need them. We distribute donated running shoes to youth programs across Appalachia.",
      location: "Nashville, TN",
      latitude: 36.1627,
      longitude: -86.7816,
      verified: true,
      showShippingAddress: false,
    },
    {
      id: nanoid(),
      name: "Girls on the Run Austin",
      description: "Inspiring girls to be joyful, healthy and confident through running. Many participants can't afford proper running shoes.",
      location: "Austin, TX",
      latitude: 30.2672,
      longitude: -97.7431,
      shippingAddress: "789 Congress Ave, Austin, TX 78701",
      shippingAttn: "Attn: Equipment Manager",
      showShippingAddress: true,
      verified: true,
    },
    {
      id: nanoid(),
      name: "Refugee Runners Boston",
      description: "Helping refugee families find community through running. Many arrive with only the clothes on their backs.",
      location: "Boston, MA",
      latitude: 42.3601,
      longitude: -71.0589,
      verified: false,
      showShippingAddress: false,
    },
  ];
  await db.insert(schema.organizations).values(orgs);

  console.log("Seeding users...");
  const users = [
    { id: nanoid(), email: "admin@runnersinneed.com", name: "Site Admin", role: "admin" as const },
    { id: nanoid(), email: "coach.martinez@portland.org", name: "Coach Martinez", role: "organizer" as const, orgId: orgs[0].id },
    { id: nanoid(), email: "sarah@backonmyfeet.org", name: "Sarah Chen", role: "organizer" as const, orgId: orgs[1].id },
    { id: nanoid(), email: "mike@soles4souls.org", name: "Mike Johnson", role: "organizer" as const, orgId: orgs[2].id },
    { id: nanoid(), email: "lisa@gotraustin.org", name: "Lisa Park", role: "organizer" as const, orgId: orgs[3].id },
    { id: nanoid(), email: "ahmed@refugeerunners.org", name: "Ahmed Hassan", role: "organizer" as const, orgId: orgs[4].id },
    { id: nanoid(), email: "runner42@gmail.com", name: "Jamie Thompson", role: "donor" as const },
    { id: nanoid(), email: "marathonmom@yahoo.com", name: "Rachel Green", role: "donor" as const },
    { id: nanoid(), email: "ultrarunner@outlook.com", name: "David Kim", role: "donor" as const },
  ];
  await db.insert(schema.users).values(users);

  console.log("Seeding needs...");
  const needsList = [
    // Portland Running Project
    {
      id: nanoid(),
      orgId: orgs[0].id,
      categoryTag: "shoes" as const,
      title: "Men's running shoes, sizes 9-12",
      body: "Our members go through shoes fast training on Portland's wet streets. We need neutral road shoes in men's sizes 9-12. Gently used is perfectly fine — our runners are just grateful to have proper footwear. Any brand works but we've had great luck with Brooks and ASICS holding up in the rain.",
      extrasWelcome: true,
      location: "Portland, OR",
      latitude: 45.5152,
      longitude: -122.6784,
      status: "active" as const,
      expiresAt: daysFromNow(75),
      createdAt: daysAgo(15),
      updatedAt: daysAgo(15),
    },
    {
      id: nanoid(),
      orgId: orgs[0].id,
      categoryTag: "apparel" as const,
      title: "Rain jackets and waterproof layers",
      body: "Portland rain is no joke and our runners train year-round. Looking for lightweight waterproof or water-resistant running jackets in M/L/XL. Doesn't need to be fancy — just something to keep the rain off during our 6am group runs.",
      extrasWelcome: true,
      location: "Portland, OR",
      latitude: 45.5152,
      longitude: -122.6784,
      status: "active" as const,
      expiresAt: daysFromNow(60),
      createdAt: daysAgo(8),
      updatedAt: daysAgo(8),
    },
    // Back on My Feet Chicago
    {
      id: nanoid(),
      orgId: orgs[1].id,
      categoryTag: "shoes" as const,
      title: "Women's running shoes, any size",
      body: "We've had an influx of women joining our program this quarter (amazing!) but we're short on shoes. Any women's running shoe in reasonable condition helps. Our members use them for daily 3-mile training runs plus a 5K race each month.",
      extrasWelcome: false,
      location: "Chicago, IL",
      latitude: 41.8781,
      longitude: -87.6298,
      status: "active" as const,
      expiresAt: daysFromNow(90),
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
    {
      id: nanoid(),
      orgId: orgs[1].id,
      categoryTag: "apparel" as const,
      title: "Cold weather running gear for Chicago winter",
      body: "Chicago winters are brutal but we don't stop running. Need thermal tights, fleece-lined running pants, balaclavas, and insulated gloves. Our members train 3x/week rain, snow, or shine. Sizes M-XXL most needed.",
      extrasWelcome: true,
      location: "Chicago, IL",
      latitude: 41.8781,
      longitude: -87.6298,
      status: "partially_fulfilled" as const,
      expiresAt: daysFromNow(45),
      createdAt: daysAgo(30),
      updatedAt: daysAgo(5),
    },
    // Soles4Souls
    {
      id: nanoid(),
      orgId: orgs[2].id,
      categoryTag: "shoes" as const,
      title: "Youth running shoes (kids sizes 3-7)",
      body: "Spring track season is starting and many of our kids in rural Tennessee don't have proper running shoes. We serve 12 schools across 3 counties. Kids sizes 3-7 most needed. New or gently used — these kids just want to run.",
      extrasWelcome: false,
      location: "Nashville, TN",
      latitude: 36.1627,
      longitude: -86.7816,
      status: "active" as const,
      expiresAt: daysFromNow(30),
      createdAt: daysAgo(20),
      updatedAt: daysAgo(20),
    },
    // Girls on the Run Austin
    {
      id: nanoid(),
      orgId: orgs[3].id,
      categoryTag: "accessories" as const,
      title: "Water bottles and running belts",
      body: "Texas heat means hydration is non-negotiable. Need handheld water bottles or running belts with bottle holders for our spring program. We have 45 girls registered and about half don't have their own hydration gear.",
      extrasWelcome: true,
      location: "Austin, TX",
      latitude: 30.2672,
      longitude: -97.7431,
      status: "active" as const,
      expiresAt: daysFromNow(55),
      createdAt: daysAgo(10),
      updatedAt: daysAgo(10),
    },
    {
      id: nanoid(),
      orgId: orgs[3].id,
      categoryTag: "apparel" as const,
      title: "Girls' athletic shorts and tops (youth M/L)",
      body: "Many of our participants show up in jeans and cotton tees. Running in Texas heat in cotton is miserable. Looking for moisture-wicking shorts and tops in girls' youth M and L. Bright colors preferred — the girls love feeling like 'real runners'.",
      extrasWelcome: true,
      location: "Austin, TX",
      latitude: 30.2672,
      longitude: -97.7431,
      status: "active" as const,
      expiresAt: daysFromNow(80),
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    },
    // Refugee Runners Boston
    {
      id: nanoid(),
      orgId: orgs[4].id,
      categoryTag: "shoes" as const,
      title: "Family running shoes — all sizes needed",
      body: "We just welcomed 8 new refugee families from East Africa. Parents and kids all want to join our running club but most only have sandals or dress shoes. We need running shoes in every size from kids 1 through men's 13 and women's 11. These families are starting over and running together is how they're building community.",
      extrasWelcome: true,
      location: "Boston, MA",
      latitude: 42.3601,
      longitude: -71.0589,
      status: "active" as const,
      expiresAt: daysFromNow(85),
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    // Fulfilled need (for testing different states)
    {
      id: nanoid(),
      orgId: orgs[0].id,
      categoryTag: "other" as const,
      title: "Foam rollers and recovery tools",
      body: "Our runners are training hard and getting sore. Need foam rollers, lacrosse balls, or any recovery tools to help them stay healthy.",
      extrasWelcome: false,
      location: "Portland, OR",
      latitude: 45.5152,
      longitude: -122.6784,
      status: "fulfilled" as const,
      expiresAt: daysFromNow(10),
      createdAt: daysAgo(45),
      updatedAt: daysAgo(7),
    },
  ];
  await db.insert(schema.needs).values(needsList);

  console.log("Seeding pledges...");
  const pledgesList = [
    {
      id: nanoid(),
      needId: needsList[0].id,
      donorId: users[6].id,
      donorEmail: users[6].email,
      donorName: users[6].name,
      description: "I have 3 pairs of Brooks Ghost 15 in sizes 10, 10.5, and 11. All have about 200 miles on them — still plenty of life left.",
      status: "ready_to_deliver" as const,
      createdAt: daysAgo(12),
      updatedAt: daysAgo(10),
    },
    {
      id: nanoid(),
      needId: needsList[0].id,
      donorId: users[8].id,
      donorEmail: users[8].email,
      donorName: users[8].name,
      description: "I rotate through shoes quickly for ultra training. Have 2 pairs ASICS Gel-Nimbus size 12, maybe 150 miles each.",
      status: "collecting" as const,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    },
    {
      id: nanoid(),
      needId: needsList[2].id,
      donorId: users[7].id,
      donorEmail: users[7].email,
      donorName: users[7].name,
      description: "My daughter outgrew her shoes. Have women's Nike Pegasus 8.5 and New Balance Fresh Foam 9, both barely worn.",
      status: "collecting" as const,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      id: nanoid(),
      needId: needsList[3].id,
      donorEmail: "anonymous@example.com",
      donorName: "Anonymous Runner",
      description: "Shipping a box with 2 pairs thermal tights (M, L), a balaclava, and some hand warmers. Stay warm out there!",
      status: "delivered" as const,
      createdAt: daysAgo(25),
      updatedAt: daysAgo(15),
    },
    {
      id: nanoid(),
      needId: needsList[4].id,
      donorId: users[6].id,
      donorEmail: users[6].email,
      donorName: users[6].name,
      description: "My kids' running club had a shoe drive. We collected 15 pairs in youth sizes 3-6. Will ship this week!",
      status: "ready_to_deliver" as const,
      createdAt: daysAgo(18),
      updatedAt: daysAgo(14),
    },
    {
      id: nanoid(),
      needId: needsList[7].id,
      donorId: users[8].id,
      donorEmail: users[8].email,
      donorName: users[8].name,
      description: "Our running group did a collection. We have shoes in men's 9-11 and women's 7-9, about 8 pairs total. Mix of brands.",
      status: "collecting" as const,
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
    // Fulfilled need pledge
    {
      id: nanoid(),
      needId: needsList[8].id,
      donorId: users[7].id,
      donorEmail: users[7].email,
      donorName: users[7].name,
      description: "Sent 4 foam rollers and a set of lacrosse balls. Hope they help!",
      status: "delivered" as const,
      createdAt: daysAgo(40),
      updatedAt: daysAgo(7),
    },
  ];
  await db.insert(schema.pledges).values(pledgesList);

  console.log("Seeding messages...");
  await db.insert(schema.messages).values([
    {
      id: nanoid(),
      pledgeId: pledgesList[0].id,
      senderId: users[6].id,
      body: "Hi! I have the shoes packed up and ready to go. What's the best shipping address?",
      createdAt: daysAgo(11),
    },
    {
      id: nanoid(),
      pledgeId: pledgesList[0].id,
      senderId: users[1].id,
      body: "That's amazing, thank you! You can ship to 123 SE Hawthorne Blvd, Portland, OR 97214 — Attn: Coach Martinez. Our runners will be so grateful!",
      createdAt: daysAgo(10),
    },
    {
      id: nanoid(),
      pledgeId: pledgesList[0].id,
      senderId: users[6].id,
      body: "Shipped! Tracking number is 1Z999AA10123456784. Should arrive Thursday.",
      createdAt: daysAgo(10),
    },
    {
      id: nanoid(),
      pledgeId: pledgesList[2].id,
      senderId: users[7].id,
      body: "Are these sizes helpful or do you need different ones?",
      createdAt: daysAgo(1),
    },
    {
      id: nanoid(),
      pledgeId: pledgesList[2].id,
      senderId: users[2].id,
      body: "8.5 and 9 are perfect! We have two new members who are exactly those sizes. Thank you so much!",
      createdAt: daysAgo(1),
    },
  ]);

  console.log("Seeding organizer requests...");
  await db.insert(schema.organizerRequests).values([
    {
      id: nanoid(),
      userId: users[5].id,
      orgName: "Refugee Runners Boston",
      orgDescription: "Helping refugee families find community through running. We meet 3x/week for group runs and provide coaching.",
      orgUrl: "https://refugeerunners.org",
      status: "pending" as const,
    },
  ]);

  console.log("\nSeed complete!");
  console.log(`  ${orgs.length} organizations`);
  console.log(`  ${users.length} users`);
  console.log(`  ${needsList.length} needs`);
  console.log(`  ${pledgesList.length} pledges`);
  console.log(`  5 messages`);
  console.log(`  1 organizer request (pending)`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
