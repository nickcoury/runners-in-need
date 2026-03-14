import { construct } from "drizzle-orm/libsql/driver-core";
import { createClient } from "@libsql/client/web";
import { getEnv } from "../lib/env";
import * as schema from "./schema";

function getClient() {
  const url = getEnv("TURSO_DATABASE_URL");
  const authToken = getEnv("TURSO_AUTH_TOKEN");

  if (!url) {
    throw new Error("TURSO_DATABASE_URL is not set");
  }

  // Wrap native fetch to handle cross-fetch Request objects from @libsql/hrana-client.
  // The hrana client creates Request objects via cross-fetch which aren't native Requests,
  // so the native fetch() can't process them directly.
  const compatFetch: typeof globalThis.fetch = (input, init) => {
    if (input instanceof globalThis.Request) {
      return globalThis.fetch(input, init);
    }
    if (typeof input === "string" || input instanceof URL) {
      return globalThis.fetch(input, init);
    }
    // cross-fetch Request object — extract URL and options
    const req = input as Record<string, unknown>;
    return globalThis.fetch(String(req.url ?? req), init ?? {
      method: req.method as string,
      headers: req.headers as HeadersInit,
      body: (req.body ?? req._bodyInit) as BodyInit,
    });
  };

  return createClient({
    url,
    authToken,
    fetch: compatFetch,
  });
}

let _db: ReturnType<typeof createDb> | null = null;

function createDb() {
  return construct(getClient(), { schema });
}

export function getDb() {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

export { schema };
