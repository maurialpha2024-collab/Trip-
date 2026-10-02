// Counts what the current filters would export, for the sentence above the
// download button. The download itself is a route handler, not an action,
// because it returns a file rather than data.

"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const filterSchema = z.object({
  large: z.string().uuid().nullable(),
  small: z.string().uuid().nullable(),
  completeOnly: z.boolean(),
});

export type ExportCounts = {
  households: number;
  persons: number;
};

export async function countForExport(input: unknown): Promise<ExportCounts> {
  const parsed = filterSchema.safeParse(input);

  if (!parsed.success) {
    return { households: 0, persons: 0 };
  }

  await requireAdmin();
  const supabase = await createClient();

  // household_search already carries the lineage and the person count.
  let query = supabase.from("household_search").select("person_count");

  if (parsed.data.completeOnly) {
    query = query.eq("status", "complete");
  }
  if (parsed.data.small) {
    query = query.eq("small_family_id", parsed.data.small);
  }
  if (parsed.data.large) {
    query = query.eq("large_family_id", parsed.data.large);
  }

  const { data } = await query;
  const rows = data ?? [];

  return {
    households: rows.length,
    persons: rows.reduce((sum, row) => sum + Number(row.person_count ?? 0), 0),
  };
}
