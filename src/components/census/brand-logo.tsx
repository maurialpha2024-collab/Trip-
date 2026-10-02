// The charity's emblem, from a trimmed PNG with real transparency, so it sits
// directly on light panels with no white box around it. Its dark green
// lettering disappears on a dark page, so in dark mode it gets a white plate.

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
};

export async function BrandLogo({ className, sizes, priority }: BrandLogoProps) {
  const t = await getTranslations("app");

  return (
    <span
      className={cn(
        "dark:rounded-card block dark:bg-white dark:p-4 dark:ring-1 dark:ring-white/10",
        className
      )}
    >
      <Image
        src={logo}
        alt={t("logoAlt")}
        sizes={sizes}
        priority={priority}
        // The default 75 smears the Arabic lettering in the logo.
        quality={90}
        className="h-auto w-full"
      />
    </span>
  );
}
