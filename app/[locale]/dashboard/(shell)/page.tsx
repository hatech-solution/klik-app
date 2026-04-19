import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardOverview } from "@/components/platform/dashboard-overview";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }
  const t = getMessages(locale);
  return {
    title: `${t.dashboard.navOverview} — ${t.meta.dashboardTitle} · ${t.meta.appTitle}`,
    description: t.meta.dashboardDescription,
  };
}

export default async function DashboardOverviewPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  return <DashboardOverview locale={locale as Locale} />;
}
