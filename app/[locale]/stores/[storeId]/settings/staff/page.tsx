import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StoreStaffHomeClient } from "@/components/platform/store-staff-home-client";
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
    title: `${t.store.staff.pageTitle} | ${t.store.settings.pageTitle} | ${t.meta.appTitle}`,
    description: t.meta.dashboardDescription,
  };
}

export default async function StoreSettingsStaffPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  return <StoreStaffHomeClient locale={locale as Locale} />;
}
