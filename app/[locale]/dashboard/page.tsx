import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getServerAuthTokens } from "@/lib/auth-tokens-server";
import { getMessages, isLocale } from "@/lib/i18n";
import { RouteGuard } from "@/components/providers/route-guard";
import { PlatformDashboard } from "@/components/platform/platform-dashboard";
import { isPlatformId, PLATFORM_CONFIGS } from "@/lib/platforms";

type LocaleDashboardPageProps = {
  params: Promise<{ locale: string, platform: string }>;
};

export async function generateMetadata({
  params,
}: LocaleDashboardPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const t = getMessages(locale);
  return {
    title: `${t.meta.dashboardTitle} - ${t.meta.appTitle}`,
    description: t.meta.dashboardDescription,
  };
}

export default async function LocaleDashboardPage({
  params,
}: LocaleDashboardPageProps) {
  const { locale, platform } = await params;

  if (!isLocale(locale) || !isPlatformId(platform)) {
    notFound();
  }

  const tokens = await getServerAuthTokens();
  if (!tokens?.accessToken) {
    redirect(`/${locale}/login`);
  }

  const current = PLATFORM_CONFIGS[platform];

  return (
    <RouteGuard locale={locale}>
      <PlatformDashboard locale={locale} platform={current} />
    </RouteGuard>
  );
}
