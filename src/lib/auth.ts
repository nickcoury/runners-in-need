import Google from "@auth/core/providers/google";
import Resend from "@auth/core/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { defineConfig } from "auth-astro";
import { getDb } from "../db";
import { getEnv } from "./env";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "../db/schema";

export default defineConfig({
  secret: getEnv("AUTH_SECRET"),
  trustHost: true,
  adapter: DrizzleAdapter(getDb(), {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Resend({
      apiKey: getEnv("RESEND_API_KEY"),
      from: getEnv("EMAIL_FROM") || "noreply@runnersinneed.com",
    }),
    Google({
      clientId: getEnv("GOOGLE_CLIENT_ID"),
      clientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.image = (user as any).image || null;
        (session.user as any).role = (user as any).role || "donor";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});
