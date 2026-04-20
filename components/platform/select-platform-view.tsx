"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PlatformCard } from "@/components/platform/platform-card";
import { LoadingRegion, SelectPlatformGridSkeleton } from "@/components/ui/screen-loading-skeletons";
import { notifyError } from "@/lib/toast";
import { isUnauthorizedError } from "@/lib/api/error";
import { fetchPlatforms, mapApiPlatformsToConfigs } from "@/lib/api/platform";
import { getMessages, type Locale } from "@/lib/i18n";
import { type PlatformConfig } from "@/lib/platforms";

type SelectPlatformViewProps = {
  locale: Locale;
};

export function SelectPlatformView({ locale }: SelectPlatformViewProps) {
  const router = useRouter();
  const t = getMessages(locale);
  const [phase, setPhase] = useState<"loading" | "error" | "ready">("loading");
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const rows = await fetchPlatforms();
        if (cancelled) {
          return;
        }
        setPlatforms(mapApiPlatformsToConfigs(rows));
        setPhase("ready");
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (isUnauthorizedError(error)) {
          router.replace(`/${locale}/login`);
          return;
        }
        notifyError(getMessages(locale).toast.loadPlatformsFailed);
        setPhase("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [locale, router]);

  return (
    <main className="select-platform-page mx-auto min-h-screen w-full max-w-6xl px-4 py-12">
      <div className="select-platform-panel">
        <h1 className="select-platform-title">{t.selectPlatform.title}</h1>
        <p className="select-platform-lead">{t.selectPlatform.description}</p>

        {phase === "loading" ? (
          <LoadingRegion aria-label={t.selectPlatform.loading} className="mt-8">
            <SelectPlatformGridSkeleton />
          </LoadingRegion>
        ) : null}

        {phase === "error" ? (
          <div className="select-platform-error">
            <p>{t.selectPlatform.loadError}</p>
          </div>
        ) : null}

        {phase === "ready" && platforms.length === 0 ? (
          <p className="select-platform-empty">{t.selectPlatform.noPlatforms}</p>
        ) : null}

        {phase === "ready" && platforms.length > 0 ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {platforms.map((platform) => (
              <PlatformCard key={platform.id} locale={locale} platform={platform} />
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
