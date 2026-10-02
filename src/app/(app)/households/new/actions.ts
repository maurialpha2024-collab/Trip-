// Server actions for the registration form. Each one takes unknown input and
// re-runs the same zod schema the browser used, because anything arriving here
// could have been sent by something other than our form.

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { phonePrefix } from "@/lib/constants";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { householdSchema, stepSchema } from "@/lib/validation/household";
import {
  personSchema,
  type BirthDateValue,
  type PersonInput,
} from "@/lib/validation/person";

export type PersonRole = "father" | "mother" | "child";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

const failed = "تعذّر الحفظ. حاول مرة أخرى.";
const nniTaken = "رقم التعريف الوطني مستعمل.";
const uniqueViolation = "23505";

function toStoredDate(birthDate: BirthDateValue): {
  date: string;
  precision: "day" | "year";
} {
  if (birthDate.yearOnly || birthDate.day === null || birthDate.month === null) {
    return { date: `${birthDate.year}-01-01`, precision: "year" };
  }

  const month = String(birthDate.month).padStart(2, "0");
  const day = String(birthDate.day).padStart(2, "0");

  return { date: `${birthDate.year}-${month}-${day}`, precision: "day" };
}

// The one place a validated person becomes a database row.
function toPersonRow(
  householdId: string,
  role: PersonRole,
  person: PersonInput,
  sortOrder: number
) {
  const { date, precision } = toStoredDate(person.birthDate);

  return {
    household_id: householdId,
    role,
    full_name: person.fullName,
    gender: person.gender,
    birth_date: date,
    birth_date_precision: precision,
    nni: person.nni,
    phone: person.phone ? `${phonePrefix}${person.phone}` : null,
    wilaya: person.wilaya,
    job: person.job,
    education_level: person.educationLevel,
    marital_status: person.maritalStatus,
    is_alive: person.isAlive,
    mother_id: person.motherId,
    sort_order: sortOrder,
  };
}

export async function saveHouseholdStep(
  input: unknown,
  householdId: string | null
): Promise<ActionResult<{ id: string }>> {
  const parsed = householdSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const profile = await requireProfile();
  const supabase = await createClient();

  const fields = {
    small_family_id: parsed.data.smallFamilyId,
    family_name: parsed.data.familyName,
    wilaya: parsed.data.wilaya,
    city: parsed.data.city,
    address_notes: parsed.data.addressNotes,
    updated_by: profile.id,
  };

  if (householdId) {
    const { data, error } = await supabase
      .from("households")
      .update(fields)
      .eq("id", householdId)
      .select("id")
      .single();

    return error || !data ? { ok: false, message: failed } : { ok: true, data };
  }

  const { data, error } = await supabase
    .from("households")
    .insert({ ...fields, created_by: profile.id, last_step: 3 })
    .select("id")
    .single();

  return error || !data ? { ok: false, message: failed } : { ok: true, data };
}

const peopleStepSchema = z.object({
  householdId: z.string().uuid(),
  role: z.enum(["father", "mother", "child"]),
  nextStep: stepSchema,
  hasNoChildren: z.boolean().nullable(),
  people: z
    .array(z.object({ id: z.string().uuid().nullable(), fields: z.unknown() }))
    .max(40),
});

// Where each role starts in the household's ordering: the father first, then the
// mothers, then the children.
const sortBase: Record<PersonRole, number> = { father: 0, mother: 1, child: 10 };

// Saves everything one step collected in a single request: the people are
// written together, anyone the agent removed is deleted, and the draft moves on
// to the next step. Each round trip to the database is slow, so this replaces a
// request per person.
export async function savePeopleStep(
  input: unknown
): Promise<ActionResult<{ ids: string[] }>> {
  const parsed = peopleStepSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: failed };
  }

  const { householdId, role, nextStep, hasNoChildren, people } = parsed.data;

  const rows: (ReturnType<typeof toPersonRow> & { id: string })[] = [];

  for (const [index, entry] of people.entries()) {
    const person = personSchema.safeParse(entry.fields);

    if (!person.success) {
      return { ok: false, message: person.error.issues[0].message };
    }

    rows.push({
      id: entry.id ?? crypto.randomUUID(),
      ...toPersonRow(householdId, role, person.data, sortBase[role] + index),
    });
  }

  const supabase = await createClient();

  // Both ids are validated UUIDs, so building the filter from them is safe.
  const keep = rows.map((row) => row.id);
  const removal = supabase
    .from("persons")
    .delete()
    .eq("household_id", householdId)
    .eq("role", role);

  const writeRows = () =>
    rows.length > 0
      ? supabase.from("persons").upsert(rows, { onConflict: "id" })
      : null;

  const [firstAttempt, removed] = await Promise.all([
    writeRows(),
    keep.length > 0 ? removal.not("id", "in", `(${keep.join(",")})`) : removal,
  ]);
  let upserted = firstAttempt;

  // A father saved by an earlier attempt whose answer never arrived: adopt his
  // id instead of failing on the one-father rule forever.
  if (
    role === "father" &&
    rows.length === 1 &&
    upserted?.error?.code === uniqueViolation &&
    upserted.error.message.includes("one_father")
  ) {
    const { data: existing } = await supabase
      .from("persons")
      .select("id")
      .eq("household_id", householdId)
      .eq("role", "father")
      .maybeSingle();

    if (existing) {
      rows[0].id = existing.id;
      upserted = await writeRows();
    }
  }

  const failure = upserted?.error ?? removed.error;

  if (failure) {
    return {
      ok: false,
      message: failure.code === uniqueViolation ? nniTaken : failed,
    };
  }

  // Only once the people are safely written does the draft move on, so a failed
  // save never leaves it pointing past a step that has no data.
  const { error: stepError } = await supabase
    .from("households")
    .update({
      last_step: nextStep,
      ...(hasNoChildren === null ? {} : { has_no_children: hasNoChildren }),
    })
    .eq("id", householdId);

  if (stepError) {
    return { ok: false, message: failed };
  }

  return { ok: true, data: { ids: rows.map((row) => row.id) } };
}

// Edits one person from the household page.
export async function savePerson(
  householdId: string,
  role: PersonRole,
  input: unknown,
  personId: string | null,
  sortOrder: number
): Promise<ActionResult<{ id: string }>> {
  const parsed = personSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const fields = toPersonRow(householdId, role, parsed.data, sortOrder);
  const supabase = await createClient();

  const query = personId
    ? supabase.from("persons").update(fields).eq("id", personId)
    : supabase.from("persons").insert(fields);

  const { data, error } = await query.select("id").single();

  if (error) {
    // The unique index on nni is the last line of defence behind checkNni.
    return {
      ok: false,
      message: error.code === uniqueViolation ? nniTaken : failed,
    };
  }

  return data ? { ok: true, data } : { ok: false, message: failed };
}

export async function deletePerson(
  personId: string
): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("persons").delete().eq("id", personId);

  return error ? { ok: false, message: failed } : { ok: true, data: null };
}

// Uses the security-definer function, which returns only the family name, so an
// agent never learns anything else about another agent's household.
export async function checkNni(nni: string): Promise<{
  taken: boolean;
  familyName: string | null;
  householdId: string | null;
}> {
  if (!/^[0-9]{10}$/.test(nni)) {
    return { taken: false, familyName: null, householdId: null };
  }

  const supabase = await createClient();
  const { data } = await supabase.rpc("find_household_by_nni", { p_nni: nni });
  const match = data?.[0];

  return match
    ? { taken: true, familyName: match.family_name, householdId: match.id }
    : { taken: false, familyName: null, householdId: null };
}

export async function completeHousehold(householdId: string): Promise<void> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase
    .from("households")
    .update({ status: "complete", last_step: 7, updated_by: profile.id })
    .eq("id", householdId);

  if (error) {
    return;
  }

  revalidatePath("/");
  redirect(`/households/${householdId}/saved`);
}
