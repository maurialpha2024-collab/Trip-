// The two-half frame shared by the login, setup and verify screens: the form
// on the start side, the identity panel on the end side. On phones the panel
// shrinks to a band across the top.

import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { GeoPattern } from "@/components/census/geo-pattern";

type AuthPanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export async function AuthPanel({
  title,
  description,
  children,
}: AuthPanelProps) {
  const t = await getTranslations();

  return (
    <div className="bg-canvas flex min-h-dvh flex-col lg:flex-row">
      <aside className="bg-indigo-deep text-ochre relative h-35 shrink-0 overflow-hidden lg:order-2 lg:h-auto lg:w-1/2">
        <GeoPattern className="absolute inset-0 opacity-40" />
        <div className="relative flex h-full flex-col items-center justify-center gap-3 p-6 text-center lg:p-10">
          <span className="text-title-page text-white lg:text-[2.5rem]">
            {t("app.name")}
          </span>
          <p className="text-body hidden text-white/70 lg:block">
            {t("login.tagline")}
          </p>
        </div>
      </aside>

      <section className="flex flex-1 items-center justify-center px-4 py-10 lg:order-1">
        <div className="w-full max-w-[380px] space-y-6">
          <div className="space-y-1 text-start">
            <h1 className="text-title-page text-ink">{title}</h1>
            {description ? (
              <p className="text-small text-ink-muted">{description}</p>
            ) : null}
          </div>

          {children}

          <p className="text-small text-ink-muted text-start">
            {t("login.footer")}
          </p>
        </div>
      </section>
    </div>
  );
}
