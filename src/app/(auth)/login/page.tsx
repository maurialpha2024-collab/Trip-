// Login page: username and password, inside the shared auth frame.

import { getTranslations } from "next-intl/server";
import { AuthPanel } from "../auth-panel";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const t = await getTranslations("login");

  return (
    <AuthPanel title={t("title")}>
      <LoginForm />
    </AuthPanel>
  );
}
