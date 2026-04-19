import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { RouteGuard } from "@/components/providers/route-guard";
import { PlatformDashboard } from "@/components/platform/platform-dashboard";
import { isUserLoggedInServer } from "@/lib/auth-tokens-server";
import { getMessages, isLocale } from "@/lib/i18n";

type LocaleSelectBotPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LocaleSelectBotPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const t = getMessages(locale);
  return {
    title: `${t.meta.selectBotTitle} - ${t.meta.appTitle}`,
    description: t.meta.selectBotDescription,
  };
}

export default async function LocaleSelectBotPage({ params }: LocaleSelectBotPageProps) {
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
      <PlatformDashboard locale={locale} flow="selectBot" />
    </RouteGuard>
  );
}
