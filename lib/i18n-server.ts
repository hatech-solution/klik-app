import { cookies, headers } from "next/headers";

import {
  detectLocaleFromAcceptLanguage,
  LOCALE_COOKIE_NAME,
  resolveLocale,
} from "@/lib/i18n";

export async function getServerLocale() {
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  if (localeFromCookie) {
    return resolveLocale(localeFromCookie);
  }

  const headerStore = await headers();
  return detectLocaleFromAcceptLanguage(headerStore.get("accept-language"));
}
