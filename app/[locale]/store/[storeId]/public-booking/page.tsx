import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StorePublicBookingSettingsClient } from "@/components/platform/store-public-booking-settings-client";
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
    title: `${t.store.settings.navRoutePublicBooking} | ${t.store.settings.pageTitle} | ${t.meta.appTitle}`,
    description: t.meta.dashboardDescription,
  };
}

export default async function StorePublicBookingPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  return <StorePublicBookingSettingsClient locale={locale as Locale} />;
}
