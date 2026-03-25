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

const authSecret = getEnv("AUTH_SECRET");
const resendApiKey = getEnv("RESEND_API_KEY");
const googleClientId = getEnv("GOOGLE_CLIENT_ID");
const googleClientSecret = getEnv("GOOGLE_CLIENT_SECRET");
const hasDatabaseConfig = !!getEnv("TURSO_DATABASE_URL");

export default defineConfig({
  secret: authSecret,
  trustHost: true,
  adapter: hasDatabaseConfig
    ? DrizzleAdapter(getDb(), {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
      })
    : undefined,
  providers: [
    ...(resendApiKey
      ? [Resend({
          apiKey: resendApiKey,
          from: getEnv("EMAIL_FROM") || "noreply@runnersinneed.com",
        })]
      : []),
    ...(googleClientId && googleClientSecret
      ? [Google({
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        })]
      : []),
  ],
  session: {
    strategy: hasDatabaseConfig ? "database" : "jwt",
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
