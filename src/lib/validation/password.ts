// Password rules, shared by the terminal account script, the login form and
// the staff page, so one change moves all three. Imported with a relative path
// because the terminal script runs outside the Next.js path aliases.

import { z } from "zod";
import { commonPasswords } from "../common-passwords";

export const minPasswordLength = 12;

export const weakPasswordMessage =
  "كلمة المرور ضعيفة: 12 حرفاً على الأقل، وتجنّب الكلمات الشائعة.";

function isStrongEnough(password: string, username: string): boolean {
  const lowered = password.toLowerCase();

  return (
    password.length >= minPasswordLength &&
    !commonPasswords.has(lowered) &&
    lowered !== username.trim().toLowerCase()
  );
}

export function passwordSchemaFor(username: string) {
  return z.string().refine((password) => isStrongEnough(password, username), {
    message: weakPasswordMessage,
  });
}

export type PasswordStrength = "weak" | "medium" | "strong";

// Anything the rules reject is "weak", whatever it looks like. Above that,
// length and character variety decide.
export function passwordStrength(
  password: string,
  username: string
): PasswordStrength {
  if (!isStrongEnough(password, username)) {
    return "weak";
  }

  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((pattern) =>
    pattern.test(password)
  ).length;

  return password.length >= 16 && classes >= 3 ? "strong" : "medium";
}

const generatorAlphabet =
  "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*?";

// Uses the platform's cryptographic RNG, never Math.random.
export function generatePassword(length = 14): string {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);

  return Array.from(
    values,
    (value) => generatorAlphabet[value % generatorAlphabet.length]
  ).join("");
}
