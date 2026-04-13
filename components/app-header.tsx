import Link from "next/link";

import { LanguageSwitcher } from "@/components/language-switcher";
import { getMessages, Locale } from "@/lib/i18n";

type AppHeaderProps = {
  locale: Locale;
  homeHref: string;
};

export function AppHeader({ locale, homeHref }: AppHeaderProps) {
  const t = getMessages(locale);

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href={homeHref}
          className="inline-flex items-center gap-2 text-sm text-slate-600"
        >
          <span className="text-base">💬</span>
          <span className="font-medium text-slate-900">Nano Message Support</span>
        </Link>
        <LanguageSwitcher
          locale={locale}
          vietnameseLabel={t.language.vi}
          englishLabel={t.language.en}
        />
      </div>
    </header>
  );
}
