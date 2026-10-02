import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Hides the floating Next.js developer badge and its route/Turbopack menu.
  devIndicators: false,
  images: {
    // 100 is for the logo: its Arabic lettering smears at the default 75.
    qualities: [75, 100],
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
