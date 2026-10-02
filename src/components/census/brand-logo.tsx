// The charity's emblem, from a trimmed PNG with real transparency, so it sits
// directly on light panels with no white box around it. Its dark green
// lettering disappears on a dark page, so in dark mode it gets a white plate.
// With `shine`, a band of light passes over it once, as on polished metal.

import Image from "next/image";
import { getTranslations } from "next-intl/server";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  // Sets the width; the height follows the image's own proportions.
  className?: string;
  // Must match the rendered width at each breakpoint, so the browser downloads
  // a file of the right size rather than the full original.
  sizes: string;
  priority?: boolean;
  shine?: boolean;
};

export async function BrandLogo({
  className,
  sizes,
  priority,
  shine,
}: BrandLogoProps) {
  const t = await getTranslations("app");

  return (
    <span
      className={cn(
        "dark:rounded-card block dark:bg-white dark:p-4 dark:ring-1 dark:ring-white/10",
        className
      )}
    >
      <span className="relative block overflow-hidden">
        <Image
          src={logo}
          alt={t("logoAlt")}
          sizes={sizes}
          priority={priority}
          // The default 75 smears the Arabic lettering in the logo; the logo
          // is shown on one screen only, so the larger file is affordable.
          quality={100}
          className="h-auto w-full"
        />
        {/* soft-light leaves the white around the emblem untouched and only
            brightens the green and gold it passes over. */}
        {shine ? (
          <span
            aria-hidden="true"
            className="animate-shine pointer-events-none absolute inset-y-0 start-0 w-1/2 bg-[linear-gradient(100deg,transparent_20%,color-mix(in_oklab,white_85%,transparent)_50%,transparent_80%)] mix-blend-soft-light [--shine-dir:1] rtl:[--shine-dir:-1]"
          />
        ) : null}
      </span>
    </span>
  );
}
