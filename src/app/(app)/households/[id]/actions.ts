// Actions for one household. Person edits reuse the actions from the
// registration form, so there is only one place that writes a person.

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { householdSchema } from "@/lib/validation/household";
import type { ActionResult } from "../new/actions";

const failed = "تعذّر الحفظ. حاول مرة أخرى.";

export async function updateHousehold(
  householdId: string,
  input: unknown
): Promise<ActionResult<null>> {
  const parsed = householdSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const profile = await requireProfile();
  const supabase = await createClient();

  const fields = {
    family_name: parsed.data.familyName,
    wilaya: parsed.data.wilaya,
    city: parsed.data.city,
    address_notes: parsed.data.addressNotes,
    updated_by: profile.id,
  };

  // Only an admin may move a household to a different small family.
  const { error } =
    profile.role === "admin"
      ? await supabase
          .from("households")
          .update({ ...fields, small_family_id: parsed.data.smallFamilyId })
          .eq("id", householdId)
      : await supabase.from("households").update(fields).eq("id", householdId);

  if (error) {
    return { ok: false, message: failed };
  }

  revalidatePath(`/households/${householdId}`);
  return { ok: true, data: null };
}

export async function deleteHousehold(householdId: string): Promise<void> {
  const supabase = await createClient();

  // Row Level Security decides this: agents may delete only their own drafts,
  // admins anything. A blocked delete simply matches no rows.
  const { data } = await supabase
    .from("households")
    .delete()
    .eq("id", householdId)
    .select("id");

  if (!data || data.length === 0) {
    return;
  }

  revalidatePath("/households");
  redirect("/households");
}
