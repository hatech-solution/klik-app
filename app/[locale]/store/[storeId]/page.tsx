import { notFound } from "next/navigation";

import { StoreDashboardHub } from "@/components/platform/store-dashboard-hub";
import { isLocale, type Locale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string; storeId: string }>;
};

export default async function StoreHubPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <StoreDashboardHub locale={locale as Locale} />;
}
