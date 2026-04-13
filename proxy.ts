import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { resolvePlatformFromHost } from "@/lib/domain";
import {
  detectLocaleFromAcceptLanguage,
  LOCALE_COOKIE_NAME,
  resolveLocale,
  SUPPORTED_LOCALES,
} from "@/lib/i18n";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host");
  if (!host) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;
  const localeFromPath = getLocaleFromPath(pathname);
  const localeFromCookie = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  const preferredLocale = localeFromCookie
    ? resolveLocale(localeFromCookie)
    : detectLocaleFromAcceptLanguage(request.headers.get("accept-language"));

  const platform = resolvePlatformFromHost(host);
  const ignored =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico");

  if (ignored) {
    return NextResponse.next();
  }

  if (platform) {
    if (!localeFromPath && pathname === "/") {
      return redirectToLocalePath(request, preferredLocale, pathname);
    }

    if (localeFromPath && isLocaleRootPath(pathname, localeFromPath)) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = `/${localeFromPath}/platform/${platform}`;
      return NextResponse.rewrite(rewriteUrl);
    }

    return NextResponse.next();
  }

  if (!localeFromPath) {
    return redirectToLocalePath(request, preferredLocale, pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};

function getLocaleFromPath(pathname: string) {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  if (!firstSegment) {
    return null;
  }

  return SUPPORTED_LOCALES.includes(firstSegment as (typeof SUPPORTED_LOCALES)[number])
    ? firstSegment
    : null;
}

function isLocaleRootPath(pathname: string, locale: string) {
  return pathname === `/${locale}` || pathname === `/${locale}/`;
}

function redirectToLocalePath(
  request: NextRequest,
  locale: string,
  pathname: string,
) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return NextResponse.redirect(redirectUrl);
}
