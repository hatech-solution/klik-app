import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { isUserLoggedInServer } from "@/lib/auth-tokens-server";
import { getMessages, isLocale } from "@/lib/i18n";
import { RouteGuard } from "@/components/providers/route-guard";
import { PlatformDashboard } from "@/components/platform/platform-dashboard";

type LocaleDashboardPageProps = {
  params: Promise<{ locale: string }>;
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
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const isLoggedIn = await isUserLoggedInServer();
  if (!isLoggedIn) {
    redirect(`/${locale}/login`);
  }

  return (
    <RouteGuard locale={locale}>
      <PlatformDashboard locale={locale} />
    </RouteGuard>
  );
}
