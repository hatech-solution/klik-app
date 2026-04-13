"use client";

import { usePathname, useRouter } from "next/navigation";

import { Locale, LOCALE_COOKIE_NAME, SUPPORTED_LOCALES } from "@/lib/i18n";

type LanguageSwitcherProps = {
  locale: Locale;
  vietnameseLabel: string;
  englishLabel: string;
  className?: string;
};

export function LanguageSwitcher({
  locale,
  vietnameseLabel,
  englishLabel,
  className,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  function changeLanguage(nextLocale: Locale) {
    if (nextLocale === locale) {
      return;
    }

    document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    const nextPathname = buildPathnameWithLocale(pathname, nextLocale);
    router.replace(nextPathname);
    router.refresh();
  }

  return (
    <div className={className}>
      <select
        aria-label="Language selector"
        value={locale}
        onChange={(event) => changeLanguage(event.target.value as Locale)}
        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 outline-none ring-sky-500 focus:ring"
      >
        <option value="vi">{vietnameseLabel}</option>
        <option value="en">{englishLabel}</option>
      </select>
    </div>
  );
}

function buildPathnameWithLocale(pathname: string, locale: Locale) {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && SUPPORTED_LOCALES.includes(firstSegment as Locale)) {
    segments[0] = locale;
  } else {
    segments.unshift(locale);
  }

  return `/${segments.join("/")}`;
}
