import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { StoreSettingsLayoutClient } from "@/components/platform/store-settings-layout-client";
import { RouteGuard } from "@/components/providers/route-guard";
import { isUserLoggedInServer } from "@/lib/auth-tokens-server";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string; storeId: string }>;
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
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

export default async function StoreSettingsLayout({ children, params }: LayoutProps) {
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
      <StoreSettingsLayoutClient locale={locale as Locale} storeId={storeId}>
        {children}
      </StoreSettingsLayoutClient>
    </RouteGuard>
  );
}
