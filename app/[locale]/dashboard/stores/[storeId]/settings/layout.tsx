import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StoreSettingsLayoutClient } from "@/components/platform/store-settings-layout-client";
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

  return (
    <StoreSettingsLayoutClient locale={locale as Locale} storeId={storeId}>
      {children}
    </StoreSettingsLayoutClient>
  );
}
