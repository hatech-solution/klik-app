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
      type="button"
      onClick={handleSelect}
      data-platform={platform.id}
      className="platform-select-card group cursor-pointer rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3">
        <img src={platform.logo} alt={platform.name} className="h-8 w-8 object-contain" />
        <h2 className="platform-select-card__title">{platform.name}</h2>
      </div>
      <p className="platform-select-card__desc">{t.selectPlatform.platformDescriptions[platform.id]}</p>
      <div className="platform-select-card__cta">{t.selectPlatform.continueToSelectBot} →</div>
    </button>
  );
}
