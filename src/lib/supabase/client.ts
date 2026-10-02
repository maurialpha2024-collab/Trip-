// Supabase client for client components. Public anon key only, so every query
// still passes through Row Level Security.
// The env vars are read as literals because Next.js only inlines them into the
// browser bundle when they are written out in full.

import { createBrowserClient } from "@supabase/ssr";
import { assertEnv } from "./env";
import type { Database } from "./types";

export function createClient() {
  return createBrowserClient<Database>(
    assertEnv(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      "NEXT_PUBLIC_SUPABASE_URL"
    ),
    assertEnv(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    )
  );
}
