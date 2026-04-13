import Link from "next/link";

import { getMessages, Locale } from "@/lib/i18n";
import { PlatformConfig } from "@/lib/platforms";

type PlatformCardProps = {
  locale: Locale;
  platform: PlatformConfig;
  href: string;
};

export function PlatformCard({ locale, platform, href }: PlatformCardProps) {
  const t = getMessages(locale);

  return (
    <Link
      href={href}
      className={`group rounded-2xl border p-6 shadow-sm transition ${platform.surfaceClassName}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{platform.logo}</span>
        <h2 className="text-xl font-semibold text-slate-900">{platform.name}</h2>
      </div>
      <p className="mt-3 text-sm text-slate-700">
        {t.selectPlatform.platformDescriptions[platform.id]}
      </p>
      <div className="mt-4 text-sm font-medium text-slate-900">
        {t.selectPlatform.gotoSubdomain} {platform.id}. →
      </div>
    </Link>
  );
}
