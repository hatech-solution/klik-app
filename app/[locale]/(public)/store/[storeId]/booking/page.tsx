import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicBookingRuntimeClient } from "@/components/booking/public-booking-runtime-client";
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
    title: `${t.store.bookingRuntimeMobile.pageTitle} | ${t.meta.appTitle}`,
    description: t.store.bookingRuntimeMobile.pageDescription,
  };
}

export default async function PublicStoreBookingPage({ params }: PageProps) {
  const { locale, storeId } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  return <PublicBookingRuntimeClient locale={locale as Locale} storeId={storeId} />;
}
