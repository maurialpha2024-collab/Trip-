// Everyday admin sign-in: the six-digit code from the authenticator app.

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { AuthPanel } from "../../auth-panel";
import { CodeForm } from "../code-form";

export default async function MfaVerifyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const verified = (factors?.all ?? []).find(
    (factor) => factor.factor_type === "totp" && factor.status === "verified"
  );

  if (!verified) {
    redirect("/login/setup");
  }

  const t = await getTranslations("mfa");

  return (
    <AuthPanel title={t("verifyTitle")} description={t("verifyHelp")}>
      <CodeForm factorId={verified.id} />
    </AuthPanel>
  );
}
