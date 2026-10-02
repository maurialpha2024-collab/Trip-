// What the login form accepts, checked on the client and again in the server
// action. The failure messages are deliberately generic: the server never says
// which of the two fields was wrong.

import { z } from "zod";
import { usernameSchema } from "./username";

export const requiredFieldMessage = "هذا الحقل مطلوب.";

export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, requiredFieldMessage),
});

export type LoginInput = z.infer<typeof loginSchema>;

// The six digits from an authenticator app.
export const totpCodeSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{6}$/, requiredFieldMessage);
