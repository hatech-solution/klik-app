import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";

import { RouteGuard } from "@/components/providers/route-guard";
import { isUserLoggedInServer } from "@/lib/auth-tokens-server";
import { isLocale } from "@/lib/i18n";

type DashboardRootLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DashboardRootLayout({ children, params }: DashboardRootLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const isLoggedIn = await isUserLoggedInServer();
  if (!isLoggedIn) {
    redirect(`/${locale}/login`);
  }

  return <RouteGuard locale={locale}>{children}</RouteGuard>;
}
