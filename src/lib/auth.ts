import Google from "@auth/core/providers/google";
import Resend from "@auth/core/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { defineConfig } from "auth-astro";
import { getDb } from "../db";
import { getEnv } from "./env";

export default defineConfig({
  adapter: DrizzleAdapter(getDb()),
  providers: [
    Resend({
      apiKey: getEnv("RESEND_API_KEY"),
      from: getEnv("EMAIL_FROM") || "noreply@runnersinneed.org",
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
      // Include role in session so pages can check it
      if (session.user) {
        session.user.id = user.id;
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
