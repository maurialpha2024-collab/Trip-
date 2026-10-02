// The household's own fields, checked in the browser and again in the server
// action that writes the draft.

import { z } from "zod";
import { wilayaKeys } from "../constants";
import { requiredMessage } from "./person";

export const familyNameMessage = "اسم الأسرة من 2 إلى 120 حرفاً.";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value))
  .nullable();

export const householdSchema = z.object({
  smallFamilyId: z.string().uuid({ message: requiredMessage }),
  familyName: z
    .string()
    .trim()
    .min(2, familyNameMessage)
    .max(120, familyNameMessage),
  wilaya: optionalText.refine(
    (value) => value === null || wilayaKeys.includes(value),
    { message: requiredMessage }
  ),
  city: optionalText,
  addressNotes: optionalText,
});

export type HouseholdInput = z.infer<typeof householdSchema>;

// Which step a draft resumes at. Steps 1 and 2 are only choices, so nothing is
// stored before step 3.
export const firstSavedStep = 3;
export const lastStep = 7;

export const stepSchema = z
  .number()
  .int()
  .min(firstSavedStep)
  .max(lastStep);
