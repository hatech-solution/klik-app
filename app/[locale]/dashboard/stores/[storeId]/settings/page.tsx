import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { StoreSettingsPage } from "@/components/platform/store-operating-hours-view";
import { RouteGuard } from "@/components/providers/route-guard";
import { isUserLoggedInServer } from "@/lib/auth-tokens-server";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string; storeId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }
  const t = getMessages(locale);
  return {
    title: `${t.store.settings.pageTitle} | ${t.meta.appTitle}`,
    description: t.meta.dashboardDescription,
  };
}

export default async function StoreSettingsRoutePage({ params }: PageProps) {
  const { locale, storeId } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const isLoggedIn = await isUserLoggedInServer();
  if (!isLoggedIn) {
    redirect(`/${locale}/login`);
  }

  return (
    <RouteGuard locale={locale}>
      <StoreSettingsPage locale={locale as Locale} storeId={storeId} />
    </RouteGuard>
  );
}
