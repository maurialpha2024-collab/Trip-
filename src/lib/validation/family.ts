// The family tree the admin maintains: large families and the small families
// inside them. Checked in the dialog and again in the server action.

import { z } from "zod";

export const familyNameMessage = "الاسم من حرفين إلى 120 حرفاً.";
export const duplicateNameMessage = "هذا الاسم موجود مسبقاً.";

const optionalNotes = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value))
  .nullable();

export const largeFamilySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, familyNameMessage)
    .max(120, familyNameMessage),
  notes: optionalNotes,
});

export const smallFamilySchema = largeFamilySchema.extend({
  largeFamilyId: z.string().uuid({ message: familyNameMessage }),
});

export type LargeFamilyInput = z.infer<typeof largeFamilySchema>;
export type SmallFamilyInput = z.infer<typeof smallFamilySchema>;
