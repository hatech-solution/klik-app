import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StoreSettingsRoutePlaceholder } from "@/components/platform/store-settings-route-placeholder";
import { getMessages, isLocale } from "@/lib/i18n";

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
    title: `${t.store.settings.navRouteServices} | ${t.store.settings.pageTitle} | ${t.meta.appTitle}`,
    description: t.meta.dashboardDescription,
  };
}

export default async function StoreSettingsServicesPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  return <StoreSettingsRoutePlaceholder kind="services" />;
}
