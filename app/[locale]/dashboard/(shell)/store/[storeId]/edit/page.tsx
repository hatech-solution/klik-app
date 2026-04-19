import { notFound } from "next/navigation";

import { StoreEditFormClient } from "@/components/platform/store-edit-form-client";
import { isLocale, type Locale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string; storeId: string }>;
};

export default async function DashboardStoreEditPage({ params }: PageProps) {
  const { locale, storeId } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <StoreEditFormClient locale={locale as Locale} storeId={storeId} />;
}
