// Fills the database with sample households for local development only.
// Attaches them to whatever agent accounts already exist, so run
// npm run create-user first. Run with: npm run seed-households

import { createAdminClient } from "../src/lib/supabase/admin";
import { sampleHouseholds } from "./sample-households";

let nniCounter = 1_000_000_000;
let phoneCounter = 2_100_000;

function nextNni(): string {
  nniCounter += 7;
  return String(nniCounter);
}

function nextPhone(): string {
  phoneCounter += 13;
  return `+2223${String(phoneCounter).slice(-7)}`;
}

function birthDateYearsAgo(years: number): string {
  return `${new Date().getFullYear() - years}-01-01`;
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    fail("هذا الأمر للتطوير فقط، ولا يعمل في بيئة الإنتاج.");
  }

  const supabase = createAdminClient();

  const { data: agents } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "agent")
    .eq("is_active", true);

  if (!agents || agents.length === 0) {
    fail("لا يوجد أي حساب باحث. أنشئ حساباً أولاً: npm run create-user");
  }

  const { data: smallFamilies } = await supabase
    .from("small_families")
    .select("id, name");

  const smallFamilyByName = new Map(
    (smallFamilies ?? []).map((row) => [row.name, row.id])
  );

  let created = 0;

  for (const [index, sample] of sampleHouseholds.entries()) {
    const smallFamilyId = smallFamilyByName.get(sample.smallFamily);
    if (!smallFamilyId) {
      console.log(`تخطّي ${sample.familyName}: العائلة الصغيرة غير موجودة.`);
      continue;
    }

    const { data: existing } = await supabase
      .from("households")
      .select("id")
      .eq("family_name", sample.familyName)
      .maybeSingle();

    if (existing) {
      continue;
    }

    const { data: household, error: householdError } = await supabase
      .from("households")
      .insert({
        small_family_id: smallFamilyId,
        family_name: sample.familyName,
        wilaya: sample.wilaya,
        city: sample.city,
        status: sample.status,
        last_step: sample.status === "draft" ? 5 : 7,
        created_by: agents[index % agents.length].id,
      })
      .select("id")
      .single();

    if (householdError || !household) {
      fail(`تعذّر إنشاء ${sample.familyName}: ${householdError?.message}`);
    }

    const { data: parents, error: parentsError } = await supabase
      .from("persons")
      .insert([
        {
          household_id: household.id,
          role: "father",
          full_name: sample.father,
          gender: "male",
          birth_date: birthDateYearsAgo(45),
          birth_date_precision: "year",
          nni: nextNni(),
          phone: nextPhone(),
          wilaya: sample.wilaya,
          job: "تاجر",
          education_level: "secondary",
          marital_status: "married",
          sort_order: 0,
        },
        {
          household_id: household.id,
          role: "mother",
          full_name: sample.mother,
          gender: "female",
          birth_date: birthDateYearsAgo(40),
          birth_date_precision: "year",
          nni: nextNni(),
          wilaya: sample.wilaya,
          education_level: "primary",
          marital_status: "married",
          sort_order: 1,
        },
      ])
      .select("id, role");

    if (parentsError) {
      fail(`تعذّر إضافة الوالدين في ${sample.familyName}: ${parentsError.message}`);
    }

    const motherId =
      parents?.find((person) => person.role === "mother")?.id ?? null;

    const { error: childrenError } = await supabase.from("persons").insert(
      sample.children.map((name, childIndex) => ({
        household_id: household.id,
        role: "child" as const,
        full_name: name,
        gender: name.includes("بنت") ? ("female" as const) : ("male" as const),
        birth_date: birthDateYearsAgo(4 + childIndex * 3),
        birth_date_precision: "year" as const,
        marital_status: "single" as const,
        mother_id: motherId,
        sort_order: childIndex + 2,
      }))
    );

    if (childrenError) {
      fail(`تعذّر إضافة الأبناء في ${sample.familyName}: ${childrenError.message}`);
    }

    created += 1;
  }

  console.log(`تمت إضافة ${created} أسرة تجريبية.`);
}

main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : "خطأ غير متوقع.");
});
