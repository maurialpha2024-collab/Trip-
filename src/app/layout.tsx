// Root layout: loads the two fonts and sets the page language, direction and
// theme from cookies, so Arabic renders right-to-left and dark mode is already
// correct before the first paint.

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { Amiri, Readex_Pro } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { defaultLocale, isLocale, localeDirection } from "@/i18n/locale";
import { defaultTheme, isTheme, themeCookieName } from "@/lib/preferences";
import "./globals.css";

const readex = Readex_Pro({
  variable: "--font-readex",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "إحصاء الأسر",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const locale = await getLocale();
  const direction = isLocale(locale)
    ? localeDirection[locale]
    : localeDirection[defaultLocale];

  const cookieStore = await cookies();
  const storedTheme = cookieStore.get(themeCookieName)?.value;
  const theme = isTheme(storedTheme) ? storedTheme : defaultTheme;

  return (
    <html
      lang={locale}
      dir={direction}
      className={theme === "dark" ? "dark" : undefined}
      suppressHydrationWarning
    >
      <body className={`${readex.variable} ${amiri.variable} antialiased`}>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
