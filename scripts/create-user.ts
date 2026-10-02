// Creates one staff account from the terminal. The owner types the username and
// password; neither is written to a file, echoed back, or stored anywhere in
// this repository. Run with: npm run create-user

import { createAdminClient } from "../src/lib/supabase/admin";
import {
  passwordSchemaFor,
  weakPasswordMessage,
} from "../src/lib/validation/password";
import {
  usernameSchema,
  usernameToEmail,
} from "../src/lib/validation/username";
import { ask } from "./prompt";

type Role = "admin" | "agent";

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

async function main(): Promise<void> {
  const fullName = (await ask("الاسم الكامل: ")).trim();
  if (fullName.length < 2) {
    fail("الاسم الكامل مطلوب.");
  }

  const parsedUsername = usernameSchema.safeParse(
    (await ask("اسم المستخدم: ")).toLowerCase()
  );
  if (!parsedUsername.success) {
    fail(parsedUsername.error.issues[0].message);
  }
  const username = parsedUsername.data;

  const roleInput = (await ask("الدور (admin / agent): ")).trim().toLowerCase();
  const role: Role | null =
    roleInput === "admin" ? "admin" : roleInput === "agent" ? "agent" : null;
  if (role === null) {
    fail("الدور يجب أن يكون admin أو agent.");
  }

  const password = await ask("كلمة المرور: ", { hidden: true });
  const confirmation = await ask("تأكيد كلمة المرور: ", { hidden: true });

  if (password !== confirmation) {
    fail("كلمتا المرور غير متطابقتين.");
  }

  if (!passwordSchemaFor(username).safeParse(password).success) {
    fail(weakPasswordMessage);
  }

  const supabase = createAdminClient();

  const { data: created, error: authError } =
    await supabase.auth.admin.createUser({
      email: usernameToEmail(username),
      password,
      email_confirm: true,
    });

  if (authError || !created?.user) {
    fail(`تعذّر إنشاء الحساب: ${authError?.message ?? "خطأ غير معروف"}`);
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: created.user.id,
    username,
    full_name: fullName,
    role,
  });

  if (profileError) {
    // Remove the auth user again so a half-created account cannot linger.
    await supabase.auth.admin.deleteUser(created.user.id);
    fail(`تعذّر حفظ بيانات الموظف: ${profileError.message}`);
  }

  console.log(`تم إنشاء الحساب: ${username} (${role})`);
}

main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : "خطأ غير متوقع.");
});
