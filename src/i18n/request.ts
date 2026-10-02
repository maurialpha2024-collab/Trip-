// Feeds next-intl the active locale and its messages on every request.
// The locale comes from a cookie, not the URL, so page addresses stay clean.

import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale, localeCookieName } from "./locale";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const stored = cookieStore.get(localeCookieName)?.value;
  const locale = isLocale(stored) ? stored : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
