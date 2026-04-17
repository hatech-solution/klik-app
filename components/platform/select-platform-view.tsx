"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PlatformCard } from "@/components/platform/platform-card";
import { fetchPlatforms, mapApiPlatformsToConfigs } from "@/lib/api/platform";
import { getClientAuthTokens } from "@/lib/auth-tokens";
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
      const tokens = getClientAuthTokens();
      if (!tokens?.accessToken) {
        router.replace(`/${locale}/login`);
        return;
      }

      const result = await fetchPlatforms(tokens.accessToken);
      if (cancelled) {
        return;
      }

      if (!result.ok && result.status === 401) {
        router.replace(`/${locale}/login`);
        return;
      }

      if (!result.ok) {
        setPhase("error");
        return;
      }

      setPlatforms(mapApiPlatformsToConfigs(result.data));
      setPhase("ready");
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [locale, router]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">{t.selectPlatform.title}</h1>
        <p className="mt-2 text-slate-600">{t.selectPlatform.description}</p>

        {phase === "loading" ? (
          <p className="mt-8 text-slate-600">{t.selectPlatform.loading}</p>
        ) : null}

        {phase === "error" ? (
          <div className="mt-8 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
            <p>{t.selectPlatform.loadError}</p>
          </div>
        ) : null}

        {phase === "ready" && platforms.length === 0 ? (
          <p className="mt-8 text-slate-600">{t.selectPlatform.noPlatforms}</p>
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
