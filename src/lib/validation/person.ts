// One person's fields. The same schema runs in the browser as the agent types
// and again inside the server action, so nothing reaches the database unchecked.

import { z } from "zod";
import { educationKeys, maritalStatusKeys, wilayaKeys } from "../constants";

export const requiredMessage = "هذا الحقل مطلوب.";
export const nameLengthMessage = "الاسم الكامل من 3 إلى 120 حرفاً.";
export const nniMessage = "رقم التعريف الوطني يتكون من 10 أرقام.";
export const phoneMessage =
  "رقم الهاتف يتكون من 8 أرقام ويبدأ بـ 2 أو 3 أو 4.";
export const futureBirthDateMessage =
  "تاريخ الميلاد لا يمكن أن يكون في المستقبل.";

const oldestYear = new Date().getFullYear() - 120;

function isOneOf(keys: string[]) {
  return (value: string) => keys.includes(value);
}

// Empty strings come from untouched optional inputs; treat them as "not given".
const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value))
  .nullable();

export const birthDateSchema = z
  .object({
    day: z.number().int().min(1).max(31).nullable(),
    month: z.number().int().min(1).max(12).nullable(),
    year: z
      .number({ message: requiredMessage })
      .int()
      .min(oldestYear)
      .max(new Date().getFullYear()),
    yearOnly: z.boolean(),
  })
  .refine(
    (value) => {
      if (value.yearOnly || value.day === null || value.month === null) {
        return true;
      }
      const entered = new Date(value.year, value.month - 1, value.day);
      return entered.getTime() <= Date.now();
    },
    { message: futureBirthDateMessage }
  );

export type BirthDateValue = z.infer<typeof birthDateSchema>;

export const personSchema = z.object({
  fullName: z.string().trim().min(3, nameLengthMessage).max(120, nameLengthMessage),
  gender: z.enum(["male", "female"], { message: requiredMessage }),
  birthDate: birthDateSchema,
  nni: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || /^[0-9]{10}$/.test(value), {
      message: nniMessage,
    })
    .transform((value) => (value.length === 0 ? null : value))
    .nullable(),
  // Stored with the +222 prefix; the form only ever asks for the 8 digits.
  phone: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || /^[234][0-9]{7}$/.test(value), {
      message: phoneMessage,
    })
    .transform((value) => (value.length === 0 ? null : value))
    .nullable(),
  wilaya: optionalText.refine(
    (value) => value === null || isOneOf(wilayaKeys)(value),
    { message: requiredMessage }
  ),
  job: optionalText,
  educationLevel: optionalText.refine(
    (value) => value === null || isOneOf(educationKeys)(value),
    { message: requiredMessage }
  ),
  maritalStatus: optionalText.refine(
    (value) => value === null || isOneOf(maritalStatusKeys)(value),
    { message: requiredMessage }
  ),
  isAlive: z.boolean(),
  motherId: z.string().uuid().nullable(),
});

export type PersonInput = z.infer<typeof personSchema>;

// Age from a date as the database stores it. Year-only dates are stored as
// 1 January but counted from 1 July, the middle of the year, so a whole cohort
// is not pushed into the wrong age band.
export function ageFromStoredDate(
  date: string | null,
  precision: string | null
): number | null {
  if (date === null) {
    return null;
  }

  const [year, month, day] = date.split("-").map(Number);
  const yearOnly = precision === "year";

  return ageFromBirthDate({
    year,
    month: yearOnly ? 7 : month,
    day: yearOnly ? 1 : day,
    yearOnly: false,
  });
}

// Age in whole years, used to decide which child fields appear. Accepts the
// half-filled form value too, and returns null while the year is still unset.
export function ageFromBirthDate(birthDate: {
  day: number | null;
  month: number | null;
  year: number | null;
  yearOnly: boolean;
}): number | null {
  if (birthDate.year === null) {
    return null;
  }

  const today = new Date();
  const month = birthDate.yearOnly ? 1 : (birthDate.month ?? 1);
  const day = birthDate.yearOnly ? 1 : (birthDate.day ?? 1);
  const born = new Date(birthDate.year, month - 1, day);

  let age = today.getFullYear() - born.getFullYear();
  const beforeBirthdayThisYear =
    today.getMonth() < born.getMonth() ||
    (today.getMonth() === born.getMonth() && today.getDate() < born.getDate());

  if (beforeBirthdayThisYear) {
    age -= 1;
  }

  return Math.max(age, 0);
}
