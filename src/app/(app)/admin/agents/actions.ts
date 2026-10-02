// Staff account management. Every action re-checks that the caller is an admin
// and re-asks for their own password, so an unlocked computer left open cannot
// be used to create accounts or change passwords.
// Passwords are never logged, never returned and never written to audit_log.

"use server";

import { createClient as createPlainClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, type Profile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import {
  passwordSchemaFor,
  weakPasswordMessage,
} from "@/lib/validation/password";
import { usernameSchema, usernameToEmail } from "@/lib/validation/username";

export type StaffResult = { ok: true } | { ok: false; message: string };

const failed = "تعذّر تنفيذ العملية.";
const wrongOwnPassword = "كلمة المرور غير صحيحة.";
const mismatch = "كلمتا المرور غير متطابقتين.";
const usernameTaken = "اسم المستخدم مستخدم من قبل.";
const cannotChangeSelf = "لا يمكنك تغيير صلاحيتك أو إيقاف حسابك.";
const lastAdmin = "لا يمكن إزالة آخر مشرف نشط.";

// Checks the admin's own password on a throwaway client, so confirming never
// touches the session cookies of the current request.
async function ownPasswordIsCorrect(
  profile: Profile,
  password: string
): Promise<boolean> {
  const client = createPlainClient(
    assertEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    assertEnv(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    ),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { error } = await client.auth.signInWithPassword({
    email: usernameToEmail(profile.username),
    password,
  });

  return !error;
}

async function confirmedAdmin(password: string): Promise<Profile | null> {
  const profile = await requireAdmin();
  return (await ownPasswordIsCorrect(profile, password)) ? profile : null;
}

// action is constrained by a check on the table, so edits are logged as
// "update". The record id identifies who was changed; nothing else is stored.
async function logAction(
  action: "create" | "update",
  recordId: string
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("audit_log")
    .insert({ action, table_name: "profiles", record_id: recordId });
}

async function activeAdminCount(exceptId: string): Promise<number> {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin")
    .eq("is_active", true)
    .neq("id", exceptId);

  return count ?? 0;
}

function refresh(): void {
  revalidatePath("/admin/agents");
}

const createSchema = z.object({
  fullName: z.string().trim().min(2, failed),
  username: usernameSchema,
  role: z.enum(["admin", "agent"]),
  password: z.string(),
  confirmPassword: z.string(),
  ownPassword: z.string(),
});

export async function createStaffAccount(input: unknown): Promise<StaffResult> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const { fullName, username, role, password, confirmPassword, ownPassword } =
    parsed.data;

  if (password !== confirmPassword) {
    return { ok: false, message: mismatch };
  }
  if (!passwordSchemaFor(username).safeParse(password).success) {
    return { ok: false, message: weakPasswordMessage };
  }

  const admin = await confirmedAdmin(ownPassword);
  if (!admin) {
    return { ok: false, message: wrongOwnPassword };
  }

  const supabase = createAdminClient();

  const { count: existing } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("username", username);

  if ((existing ?? 0) > 0) {
    return { ok: false, message: usernameTaken };
  }

  const { data: created, error } = await supabase.auth.admin.createUser({
    email: usernameToEmail(username),
    password,
    email_confirm: true,
  });

  if (error || !created.user) {
    return { ok: false, message: failed };
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: created.user.id,
    username,
    full_name: fullName,
    role,
  });

  if (profileError) {
    // Do not leave an auth user with no profile behind.
    await supabase.auth.admin.deleteUser(created.user.id);
    return { ok: false, message: failed };
  }

  await logAction("create", created.user.id);
  refresh();
  return { ok: true };
}

const updateSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().trim().min(2, failed),
  role: z.enum(["admin", "agent"]),
  ownPassword: z.string(),
});

export async function updateStaffAccount(input: unknown): Promise<StaffResult> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const admin = await confirmedAdmin(parsed.data.ownPassword);
  if (!admin) {
    return { ok: false, message: wrongOwnPassword };
  }

  if (admin.id === parsed.data.id && parsed.data.role !== "admin") {
    return { ok: false, message: cannotChangeSelf };
  }

  if (
    parsed.data.role === "agent" &&
    (await activeAdminCount(parsed.data.id)) === 0
  ) {
    return { ok: false, message: lastAdmin };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName, role: parsed.data.role })
    .eq("id", parsed.data.id);

  if (error) {
    return { ok: false, message: failed };
  }

  await logAction("update", parsed.data.id);
  refresh();
  return { ok: true };
}

const passwordChangeSchema = z.object({
  id: z.string().uuid(),
  username: usernameSchema,
  password: z.string(),
  confirmPassword: z.string(),
  ownPassword: z.string(),
});

export async function changeStaffPassword(
  input: unknown
): Promise<StaffResult> {
  const parsed = passwordChangeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  if (parsed.data.password !== parsed.data.confirmPassword) {
    return { ok: false, message: mismatch };
  }
  if (
    !passwordSchemaFor(parsed.data.username).safeParse(parsed.data.password)
      .success
  ) {
    return { ok: false, message: weakPasswordMessage };
  }

  const admin = await confirmedAdmin(parsed.data.ownPassword);
  if (!admin) {
    return { ok: false, message: wrongOwnPassword };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(parsed.data.id, {
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, message: failed };
  }

  await logAction("update", parsed.data.id);
  refresh();
  return { ok: true };
}

const activeSchema = z.object({
  id: z.string().uuid(),
  active: z.boolean(),
  ownPassword: z.string(),
});

export async function setStaffActive(input: unknown): Promise<StaffResult> {
  const parsed = activeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const admin = await confirmedAdmin(parsed.data.ownPassword);
  if (!admin) {
    return { ok: false, message: wrongOwnPassword };
  }

  if (admin.id === parsed.data.id && !parsed.data.active) {
    return { ok: false, message: cannotChangeSelf };
  }

  if (!parsed.data.active && (await activeAdminCount(parsed.data.id)) === 0) {
    return { ok: false, message: lastAdmin };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: parsed.data.active })
    .eq("id", parsed.data.id);

  if (error) {
    return { ok: false, message: failed };
  }

  await logAction("update", parsed.data.id);
  refresh();
  return { ok: true };
}

const resetMfaSchema = z.object({
  id: z.string().uuid(),
  ownPassword: z.string(),
});

export async function resetStaffMfa(input: unknown): Promise<StaffResult> {
  const parsed = resetMfaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const admin = await confirmedAdmin(parsed.data.ownPassword);
  if (!admin) {
    return { ok: false, message: wrongOwnPassword };
  }

  const supabase = createAdminClient();
  const { data: account } = await supabase.auth.admin.getUserById(
    parsed.data.id
  );

  for (const factor of account?.user?.factors ?? []) {
    await supabase.auth.admin.mfa.deleteFactor({
      userId: parsed.data.id,
      id: factor.id,
    });
  }

  await logAction("update", parsed.data.id);
  refresh();
  return { ok: true };
}
