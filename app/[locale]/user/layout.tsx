import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/platform/dashboard-shell";
import { isLocale, type Locale } from "@/lib/i18n";

type UserLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function UserLayout({ children, params }: UserLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <DashboardShell locale={locale as Locale}>{children}</DashboardShell>;
}