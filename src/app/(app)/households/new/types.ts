// The shape the wizard keeps in memory while an agent fills the form. It is
// deliberately separate from the database rows: the form holds a birth date as
// three parts and a phone without its +222, and only the server actions
// translate that into what the tables store.

import type { BirthDate } from "@/components/census/birth-date-input";
import type { PersonRole } from "./actions";

// The seven steps in order; each key names its label under "steps" in the
// message files. Step n is stepKeys[n - 1].
export const stepKeys = [
  "largeFamily",
  "smallFamily",
  "household",
  "father",
  "mother",
  "children",
  "review",
] as const;

export type PersonDraft = {
  // null until the row exists in the database.
  id: string | null;
  role: PersonRole;
  fullName: string;
  gender: "male" | "female";
  // The year stays nullable while the agent is still choosing; the schema
  // rejects a missing year when the step is saved.
  birthDate: BirthDate;
  nni: string;
  phone: string;
  wilaya: string;
  job: string;
  educationLevel: string;
  maritalStatus: string;
  isAlive: boolean;
  motherId: string | null;
};

export type WizardDraft = {
  householdId: string | null;
  largeFamilyId: string | null;
  smallFamilyId: string | null;
  familyName: string;
  wilaya: string;
  city: string;
  addressNotes: string;
  hasNoChildren: boolean;
  father: PersonDraft | null;
  mothers: PersonDraft[];
  children: PersonDraft[];
};

export type SmallFamilyOption = {
  id: string;
  name: string;
};

export type LargeFamilyOption = {
  id: string;
  name: string;
  smallFamilies: SmallFamilyOption[];
  // null for agents: they are not shown how many households a family has.
  householdCount: number | null;
};

// What the person schema expects. Shared by the wizard and the edit dialog so
// there is only one description of the mapping.
export function toPersonInput(person: PersonDraft) {
  return {
    fullName: person.fullName,
    gender: person.gender,
    birthDate: person.birthDate,
    nni: person.nni,
    phone: person.phone,
    wilaya: person.wilaya,
    job: person.job,
    educationLevel: person.educationLevel,
    maritalStatus: person.maritalStatus,
    isAlive: person.isAlive,
    motherId: person.motherId,
  };
}

export function emptyBirthDate(): BirthDate {
  return { day: null, month: null, year: null, yearOnly: false };
}

export function emptyPerson(role: PersonRole): PersonDraft {
  return {
    id: null,
    role,
    fullName: "",
    gender: role === "mother" ? "female" : "male",
    birthDate: emptyBirthDate(),
    nni: "",
    phone: "",
    wilaya: "",
    job: "",
    educationLevel: "",
    maritalStatus: "",
    isAlive: true,
    motherId: null,
  };
}

type PersonRow = {
  id: string;
  role: string;
  full_name: string;
  gender: string | null;
  birth_date: string | null;
  birth_date_precision: string | null;
  nni: string | null;
  phone: string | null;
  wilaya: string | null;
  job: string | null;
  education_level: string | null;
  marital_status: string | null;
  is_alive: boolean;
  mother_id: string | null;
  sort_order: number;
};

type HouseholdRow = {
  id: string;
  small_family_id: string;
  family_name: string;
  wilaya: string | null;
  city: string | null;
  address_notes: string | null;
  has_no_children: boolean;
};

function toBirthDate(
  date: string | null,
  precision: string | null
): BirthDate {
  if (date === null) {
    return emptyBirthDate();
  }

  const [year, month, day] = date.split("-").map(Number);
  const yearOnly = precision === "year";

  return {
    day: yearOnly ? null : day,
    month: yearOnly ? null : month,
    year,
    yearOnly,
  };
}

function toPersonDraft(row: PersonRow, phonePrefix: string): PersonDraft {
  return {
    id: row.id,
    role: row.role === "father" || row.role === "mother" ? row.role : "child",
    fullName: row.full_name,
    gender: row.gender === "female" ? "female" : "male",
    birthDate: toBirthDate(row.birth_date, row.birth_date_precision),
    nni: row.nni ?? "",
    phone: row.phone?.replace(phonePrefix, "") ?? "",
    wilaya: row.wilaya ?? "",
    job: row.job ?? "",
    educationLevel: row.education_level ?? "",
    maritalStatus: row.marital_status ?? "",
    isAlive: row.is_alive,
    motherId: row.mother_id,
  };
}

// Rebuilds the form from a saved draft, so resuming loses nothing.
export function draftFromRows(
  household: HouseholdRow,
  persons: PersonRow[],
  largeFamilyId: string,
  phonePrefix: string
): WizardDraft {
  const people = [...persons].sort((a, b) => a.sort_order - b.sort_order);
  const mapped = people.map((row) => toPersonDraft(row, phonePrefix));

  return {
    householdId: household.id,
    largeFamilyId,
    smallFamilyId: household.small_family_id,
    familyName: household.family_name,
    wilaya: household.wilaya ?? "",
    city: household.city ?? "",
    addressNotes: household.address_notes ?? "",
    hasNoChildren: household.has_no_children,
    father: mapped.find((person) => person.role === "father") ?? null,
    mothers: mapped.filter((person) => person.role === "mother"),
    children: mapped.filter((person) => person.role === "child"),
  };
}

export function emptyDraft(): WizardDraft {
  return {
    householdId: null,
    largeFamilyId: null,
    smallFamilyId: null,
    familyName: "",
    wilaya: "",
    city: "",
    addressNotes: "",
    hasNoChildren: false,
    father: null,
    mothers: [],
    children: [],
  };
}
