import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StoreStaffHoursPageClient } from "@/components/platform/store-staff-hours-page-client";
import { getMessages, isLocale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string; storeId: string; staffId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }
  const t = getMessages(locale);
  return {
    title: `${t.store.operatingHours.staffHoursTitle} | ${t.store.settings.pageTitle} | ${t.meta.appTitle}`,
    description: t.meta.dashboardDescription,
  };
}

export default async function StoreStaffHoursPage({ params }: PageProps) {
  const { locale, staffId } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  return <StoreStaffHoursPageClient staffId={staffId} />;
}
