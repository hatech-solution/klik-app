import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { PlatformCard } from "@/components/platform/platform-card";
import { getServerAuthTokens } from "@/lib/auth-tokens-server";
import { buildPlatformUrl } from "@/lib/domain";
import { getMessages, isLocale } from "@/lib/i18n";
import { PLATFORM_CONFIGS, PLATFORM_IDS } from "@/lib/platforms";

type LocaleSelectPlatformPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LocaleSelectPlatformPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const t = getMessages(locale);
  return {
    title: t.meta.selectTitle,
    description: t.meta.selectDescription,
  };
}

export default async function LocaleSelectPlatformPage({
  params,
}: LocaleSelectPlatformPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const tokens = await getServerAuthTokens();
  if (!tokens?.accessToken) {
    redirect(`/${locale}/login`);
  }

  const t = getMessages(locale);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">{t.selectPlatform.title}</h1>
        <p className="mt-2 text-slate-600">{t.selectPlatform.description}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {PLATFORM_IDS.map((platformId) => {
            const platform = PLATFORM_CONFIGS[platformId];
            return (
              <PlatformCard
                key={platform.id}
                locale={locale}
                platform={platform}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}
