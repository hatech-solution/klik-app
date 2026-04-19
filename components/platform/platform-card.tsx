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
    localStorage.removeItem("bot_id");
    setPlatform(platform.id);
    router.push(`/${locale}/select-bot`);
  };

  return (
    <button
      onClick={handleSelect}
      className={`group rounded-2xl border p-6 shadow-sm transition text-left cursor-pointer ${platform.surfaceClassName}`}
    >
      <div className="flex items-center gap-3">
        <img src={platform.logo} alt={platform.name} className="h-8 w-8 object-contain" />
        <h2 className="text-xl font-semibold text-slate-900">{platform.name}</h2>
      </div>
      <p className="mt-3 text-sm text-slate-700">
        {t.selectPlatform.platformDescriptions[platform.id]}
      </p>
      <div className="mt-4 text-sm font-medium text-slate-900 group-hover:underline">
        {t.selectPlatform.continueToSelectBot} →
      </div>
    </button>
  );
}
