'use client';

import { useRouter } from "next/navigation";
import { getMessages, Locale } from "@/lib/i18n";
import { PlatformConfig } from "@/lib/platforms";
import { usePlatformStore } from "@/store/usePlatformStore";

type PlatformCardProps = {
  locale: Locale;
  platform: PlatformConfig;
};

export function PlatformCard({ locale, platform }: PlatformCardProps) {
  const t = getMessages(locale);
  const router = useRouter();
  const { setPlatform } = usePlatformStore();

  const handleSelect = () => {
    setPlatform(platform.id);
    router.push(`/${locale}/dashboard`);
  };

  return (
    <button
      onClick={handleSelect}
      className={`group rounded-2xl border p-6 shadow-sm transition text-left cursor-pointer ${platform.surfaceClassName}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{platform.logo}</span>
        <h2 className="text-xl font-semibold text-slate-900">{platform.name}</h2>
      </div>
      <p className="mt-3 text-sm text-slate-700">
        {t.selectPlatform.platformDescriptions[platform.id]}
      </p>
      <div className="mt-4 text-sm font-medium text-slate-900 group-hover:underline">
        {locale === 'vi' ? 'Tiếp tục vào hệ thống' : 'Continue to dashboard'} →
      </div>
    </button>
  );
}
