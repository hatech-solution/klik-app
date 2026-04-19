import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StoreStaffFormClient } from "@/components/platform/store-staff-form-client";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";

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
    title: `${t.store.staff.formEditTitle} | ${t.store.settings.pageTitle} | ${t.meta.appTitle}`,
    description: t.meta.dashboardDescription,
  };
}

export default async function StoreStaffEditPage({ params }: PageProps) {
  const { locale, staffId } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  return <StoreStaffFormClient locale={locale as Locale} mode="edit" staffId={staffId} />;
}
