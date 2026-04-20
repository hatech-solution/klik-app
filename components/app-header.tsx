import Link from "next/link";

import { LanguageSwitcher } from "@/components/language-switcher";
import { LogoutButton } from "@/components/logout-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { getMessages, Locale } from "@/lib/i18n";

type AppHeaderProps = {
  locale: Locale;
  homeHref: string;
};

export function AppHeader({ locale, homeHref }: AppHeaderProps) {
  const t = getMessages(locale);

  return (
    <header className="app-header">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href={homeHref}
          className="app-header-link"
        >
          <span className="text-base">💬</span>
          <span className="app-header-brand">Klik</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeSwitcher
            lightLabel={t.theme.light}
            darkLabel={t.theme.dark}
          />
          <LanguageSwitcher
            locale={locale}
            vietnameseLabel={t.language.vi}
            englishLabel={t.language.en}
          />
          <LogoutButton locale={locale} label={t.header.logout} />
        </div>
      </div>
    </header>
  );
}
