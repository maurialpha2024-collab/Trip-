// The only place the service role key is used. This client bypasses Row Level
// Security completely, so it must never be imported from a client component.
// SUPABASE_SERVICE_ROLE_KEY has no NEXT_PUBLIC_ prefix, so Next.js will not
// send it to the browser: importing this from client code throws instead.

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { assertEnv } from "./env";
import type { Database } from "./types";

export function createAdminClient() {
  return createSupabaseClient<Database>(
    assertEnv(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      "NEXT_PUBLIC_SUPABASE_URL"
    ),
    assertEnv(
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      "SUPABASE_SERVICE_ROLE_KEY"
    ),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
