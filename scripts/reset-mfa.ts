// Removes an account's authenticator app so it can be set up again on a new
// phone. This is the owner's way in when no admin can sign in to do it from
// the الموظفون page. Run with: npm run reset-mfa

import { createAdminClient } from "../src/lib/supabase/admin";
import { usernameSchema } from "../src/lib/validation/username";
import { ask } from "./prompt";

const confirmations = new Set(["نعم", "y", "yes"]);

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

async function main(): Promise<void> {
  const parsed = usernameSchema.safeParse(
    (await ask("اسم المستخدم: ")).toLowerCase()
  );

  if (!parsed.success) {
    fail(parsed.error.issues[0].message);
  }

  const username = parsed.data;
  const supabase = createAdminClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("username", username)
    .maybeSingle();

  if (profileError) {
    fail(`تعذّر البحث: ${profileError.message}`);
  }
  if (!profile) {
    fail("لا يوجد حساب بهذا الاسم.");
  }

  const { data: account, error: accountError } =
    await supabase.auth.admin.getUserById(profile.id);

  if (accountError || !account.user) {
    fail("تعذّر قراءة بيانات الحساب.");
  }

  const factors = account.user.factors ?? [];

  if (factors.length === 0) {
    console.log("لا يوجد تحقق بخطوتين مفعّل على هذا الحساب.");
    return;
  }

  const answer = await ask(
    `إزالة التحقق بخطوتين عن ${profile.full_name} (${profile.role})؟ [y/نعم]: `
  );

  if (!confirmations.has(answer.trim().toLowerCase())) {
    console.log("أُلغيت العملية.");
    return;
  }

  for (const factor of factors) {
    const { error } = await supabase.auth.admin.mfa.deleteFactor({
      userId: profile.id,
      id: factor.id,
    });

    if (error) {
      fail(`تعذّرت الإزالة: ${error.message}`);
    }
  }

  console.log(
    `تمت إزالة التحقق بخطوتين عن: ${username}. سيُطلب إعداده من جديد عند الدخول.`
  );
}

main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : "خطأ غير متوقع.");
});
