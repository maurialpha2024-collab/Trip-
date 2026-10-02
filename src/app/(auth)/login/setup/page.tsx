// First admin sign-in: scan the QR with an authenticator app, then confirm a
// code. No admin page renders until this is finished.

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { AuthPanel } from "../../auth-panel";
import { CodeForm } from "../code-form";

const svgDataUriPrefix = "data:image/svg+xml;utf-8,";

// Supabase hands back the QR as an SVG data URI, which next/image rejects, so
// it is inlined instead. The markup comes from our own auth server, and is
// still checked to be a plain SVG before it reaches the page.
function readQrSvg(dataUri: string): string | null {
  if (!dataUri.startsWith(svgDataUriPrefix)) {
    return null;
  }

  const raw = dataUri.slice(svgDataUriPrefix.length);

  let svg: string;
  try {
    svg = decodeURIComponent(raw);
  } catch {
    svg = raw;
  }

  if (!svg.includes("<svg") || /<script/i.test(svg)) {
    return null;
  }

  return svg;
}

export default async function MfaSetupPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: factors } = await supabase.auth.mfa.listFactors();

  // Drop half-finished enrolments, so the code on screen is always the live one.
  for (const factor of factors?.all ?? []) {
    if (factor.factor_type === "totp" && factor.status === "unverified") {
      await supabase.auth.mfa.unenroll({ factorId: factor.id });
    }
  }

  const { data: enrolled, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
  });

  if (error || !enrolled) {
    redirect("/login");
  }

  const t = await getTranslations("mfa");
  const qrSvg = readQrSvg(enrolled.totp.qr_code);

  return (
    <AuthPanel title={t("setupTitle")} description={t("setupHelp")}>
      <div className="space-y-4">
        {qrSvg ? (
          <div className="border-line bg-surface rounded-card flex justify-center border p-4">
            <div
              role="img"
              aria-label={t("setupTitle")}
              className="[&>svg]:size-48"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          </div>
        ) : null}

        <div className="space-y-1">
          <p className="text-small text-ink-muted text-start">
            {t("secretLabel")}
          </p>
          <code className="border-line bg-surface text-ink rounded-control block border px-3 py-2 text-center font-mono text-sm break-all">
            {enrolled.totp.secret}
          </code>
        </div>

        <CodeForm factorId={enrolled.id} />
      </div>
    </AuthPanel>
  );
}
