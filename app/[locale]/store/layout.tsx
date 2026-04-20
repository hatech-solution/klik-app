import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/platform/dashboard-shell";
import { isLocale, type Locale } from "@/lib/i18n";

type StoreLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function StoreLayout({ children, params }: StoreLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <DashboardShell locale={locale as Locale}>{children}</DashboardShell>;
}