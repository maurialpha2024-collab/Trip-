// The frame shared by the login, setup and verify screens. The charity's
// emblem stands on a light panel at the start side (on top on phones), with
// the sign-in card beside or below it. Everything arrives in reading order:
// the emblem, the gold rule, the app name, then the card.

import { LockIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/census/brand-logo";
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
    <div className="bg-canvas grid min-h-dvh grid-rows-[auto_1fr] lg:grid-cols-[5fr_7fr] lg:grid-rows-1">
      <aside className="bg-surface relative flex flex-col items-center justify-center overflow-hidden px-4 pt-6 pb-14 lg:px-12 lg:py-24">
        <div className="relative">
          {/* A warm light behind the emblem, in the logo's gold. */}
          <div
            aria-hidden="true"
            className="animate-glow absolute -inset-16 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--ochre)_22%,transparent),transparent)]"
          />
          <BrandLogo
            priority
            sizes="(min-width: 1280px) 360px, (min-width: 1024px) 300px, 144px"
            className="animate-emblem relative w-36 lg:w-[300px] xl:w-[360px]"
          />
        </div>

        <span
          aria-hidden="true"
          className="animate-sweep bg-ochre mt-4 h-px w-20 [animation-delay:450ms] lg:mt-10 lg:w-32"
        />

        <p className="animate-rise text-title-family text-ink mt-2 text-center [animation-delay:600ms] lg:text-title-page lg:mt-4">
          {t("app.name")}
        </p>

        <OrnamentBand />
      </aside>

      <section className="flex flex-col items-center justify-start gap-5 px-4 py-6 lg:justify-center lg:gap-6 lg:px-16 lg:py-10">
        <div className="bg-surface border-line rounded-card w-full max-w-[420px] border p-5 shadow-[0_32px_64px_-32px_color-mix(in_oklab,var(--indigo)_40%,transparent)] sm:p-8">
          <div className="animate-rise mb-5 space-y-2 text-start [animation-delay:150ms] sm:mb-7">
            <h1 className="text-title-page text-ink">{title}</h1>
            {description ? (
              <p className="text-body text-ink-muted">{description}</p>
            ) : null}
          </div>

          {children}
        </div>

        <p className="animate-rise text-small text-ink-muted flex items-center gap-2 [animation-delay:700ms]">
          <LockIcon className="size-4 shrink-0" aria-hidden="true" />
          {t("login.footer")}
        </p>
      </section>
    </div>
  );
}

// The leatherwork motif as a slow-moving border along the foot of the panel.
// The pattern is one tile wider on each side than the band, so sliding it by
// one tile never uncovers an edge, whichever way the page reads.
function OrnamentBand() {
  return (
    <div
      aria-hidden="true"
      className="animate-rise absolute inset-x-0 bottom-0 h-10 overflow-hidden lg:h-16 [animation-delay:800ms] [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]"
    >
      <GeoPattern className="animate-drift text-ochre absolute inset-y-0 -start-[64px] w-[calc(100%+128px)] opacity-40" />
    </div>
  );
}
