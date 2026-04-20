import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StoreOperatingHoursEditor } from "@/components/platform/store-operating-hours-view";
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
    title: `${t.store.settings.navRouteHours} | ${t.store.settings.pageTitle} | ${t.meta.appTitle}`,
    description: t.meta.dashboardDescription,
  };
}

export default async function StoreSettingsHoursPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  return <StoreOperatingHoursEditor />;
}
