// The frame shared by the login, setup and verify screens.
// Phones: the emblem fills the top of the screen and the form is a sheet that
// rises from the bottom edge, the way a phone app asks for a sign-in.
// Desktop: the emblem stands on a light panel at the start side and the form
// is a card beside it.
// Everything arrives in reading order: the emblem, the gold rule, the app
// name, then the form.

import { LockIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/census/brand-logo";

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
    <div className="bg-surface flex min-h-dvh flex-col lg:grid lg:grid-cols-[5fr_7fr]">
      <aside className="relative flex flex-col items-center justify-center px-4 pt-8 pb-10 lg:px-12 lg:py-16">
        <div className="relative">
          {/* A warm light behind the emblem, in the logo's gold. It fades in,
              then breathes slowly. */}
          <div aria-hidden="true" className="animate-glow absolute -inset-14 lg:-inset-20">
            <div className="animate-breathe size-full rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--ochre)_14%,transparent),transparent)]" />
          </div>

          <div className="animate-float relative">
            <BrandLogo
              priority
              shine
              sizes="(min-width: 1280px) 420px, (min-width: 1024px) 340px, 224px"
              className="animate-emblem w-56 lg:w-[340px] xl:w-[420px]"
            />
          </div>
        </div>

        <span
          aria-hidden="true"
          className="animate-sweep bg-ochre mt-5 h-px w-20 [animation-delay:450ms] lg:mt-10 lg:w-32"
        />

        <p className="animate-rise text-title-family text-ink mt-2 text-center [animation-delay:600ms] lg:text-title-page lg:mt-4">
          {t("app.name")}
        </p>
      </aside>

      <section className="animate-sheet bg-canvas relative flex flex-1 flex-col items-center gap-5 rounded-t-[1.75rem] px-5 pt-7 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-18px_40px_-24px_color-mix(in_oklab,var(--indigo)_45%,transparent)] lg:animate-none lg:justify-center lg:gap-6 lg:rounded-none lg:px-16 lg:py-10 lg:shadow-none">
        <div className="w-full max-w-[420px] lg:bg-surface lg:border-line lg:rounded-card lg:border lg:p-8 lg:shadow-[0_32px_64px_-32px_color-mix(in_oklab,var(--indigo)_40%,transparent)]">
          <div className="animate-rise mb-6 space-y-2 text-start [animation-delay:350ms] lg:mb-7 lg:[animation-delay:150ms]">
            <h1 className="text-title-page text-ink">{title}</h1>
            {description ? (
              <p className="text-body text-ink-muted">{description}</p>
            ) : null}
          </div>

          {children}
        </div>

        <p className="animate-rise text-small text-ink-muted mt-auto flex items-center gap-2 [animation-delay:800ms] lg:mt-0">
          <LockIcon className="size-4 shrink-0" aria-hidden="true" />
          {t("login.footer")}
        </p>
      </section>
    </div>
  );
}
