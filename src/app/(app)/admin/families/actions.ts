// Creating, renaming and deleting families. Admin only, checked on the server:
// hiding the page in the sidebar protects nothing.

"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  duplicateNameMessage,
  largeFamilySchema,
  smallFamilySchema,
} from "@/lib/validation/family";
import type { ActionResult } from "../../households/new/actions";

const failed = "تعذّر الحفظ. حاول مرة أخرى.";
const uniqueViolation = "23505";

function refresh(): void {
  revalidatePath("/admin/families");
  // The registration form reads the same lists in steps 1 and 2.
  revalidatePath("/households/new");
}

export async function saveLargeFamily(
  input: unknown,
  familyId: string | null
): Promise<ActionResult<null>> {
  const parsed = largeFamilySchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  await requireAdmin();
  const supabase = await createClient();
  const fields = { name: parsed.data.name, notes: parsed.data.notes };

  const { error } = familyId
    ? await supabase.from("large_families").update(fields).eq("id", familyId)
    : await supabase.from("large_families").insert(fields);

  if (error) {
    return {
      ok: false,
      message: error.code === uniqueViolation ? duplicateNameMessage : failed,
    };
  }

  refresh();
  return { ok: true, data: null };
}

export async function saveSmallFamily(
  input: unknown,
  familyId: string | null
): Promise<ActionResult<null>> {
  const parsed = smallFamilySchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  await requireAdmin();
  const supabase = await createClient();
  const fields = {
    name: parsed.data.name,
    notes: parsed.data.notes,
    large_family_id: parsed.data.largeFamilyId,
  };

  const { error } = familyId
    ? await supabase.from("small_families").update(fields).eq("id", familyId)
    : await supabase.from("small_families").insert(fields);

  if (error) {
    return {
      ok: false,
      message: error.code === uniqueViolation ? duplicateNameMessage : failed,
    };
  }

  refresh();
  return { ok: true, data: null };
}

// blockedBy carries how many records stand in the way, so the page can say
// "توجد 120 أسرة مسجلة فيها" rather than a bare refusal. null means the delete
// failed for some other reason.
export type DeleteResult =
  | { ok: true }
  | { ok: false; blockedBy: number | null };

// The foreign keys are ON DELETE RESTRICT, so the database would refuse these
// anyway; counting first is what lets the message name the obstacle.
export async function deleteLargeFamily(
  familyId: string
): Promise<DeleteResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { count } = await supabase
    .from("small_families")
    .select("*", { count: "exact", head: true })
    .eq("large_family_id", familyId);

  if ((count ?? 0) > 0) {
    return { ok: false, blockedBy: count ?? 0 };
  }

  const { error } = await supabase
    .from("large_families")
    .delete()
    .eq("id", familyId);

  if (error) {
    return { ok: false, blockedBy: null };
  }

  refresh();
  return { ok: true };
}

export async function deleteSmallFamily(
  familyId: string
): Promise<DeleteResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { count } = await supabase
    .from("households")
    .select("*", { count: "exact", head: true })
    .eq("small_family_id", familyId);

  if ((count ?? 0) > 0) {
    return { ok: false, blockedBy: count ?? 0 };
  }

  const { error } = await supabase
    .from("small_families")
    .delete()
    .eq("id", familyId);

  if (error) {
    return { ok: false, blockedBy: null };
  }

  refresh();
  return { ok: true };
}
