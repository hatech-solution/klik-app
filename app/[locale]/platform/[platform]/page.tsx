import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PlatformDashboard } from "@/components/platform/platform-dashboard";
import { getServerAuthTokens } from "@/lib/auth-tokens-server";
import { getMessages, isLocale } from "@/lib/i18n";
import { PLATFORM_CONFIGS, isPlatformId } from "@/lib/platforms";

type LocalePlatformPageProps = {
  params: Promise<{ locale: string; platform: string }>;
};

export async function generateMetadata({
  params,
}: LocalePlatformPageProps): Promise<Metadata> {
  const { locale, platform } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const t = getMessages(locale);
  if (!isPlatformId(platform)) {
    return {
      title: t.meta.invalidPlatformTitle,
      description: t.meta.invalidPlatformDescription,
    };
  }

  const current = PLATFORM_CONFIGS[platform];
  return {
    title: `${current.name} Dashboard`,
    description: t.meta.platformDescription(current.name),
  };
}

export default async function LocalePlatformPage({
  params,
}: LocalePlatformPageProps) {
  const { locale, platform } = await params;

  if (!isLocale(locale) || !isPlatformId(platform)) {
    notFound();
  }

  const tokens = await getServerAuthTokens();
  if (!tokens?.accessToken) {
    redirect(`/${locale}/login`);
  }

  const current = PLATFORM_CONFIGS[platform];
  return <PlatformDashboard locale={locale} platform={current} />;
}
