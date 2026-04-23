import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { StoreShellLayoutClient } from "@/components/platform/store-shell-layout-client";
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

  return <StoreShellLayoutClient locale={locale as Locale}>{children}</StoreShellLayoutClient>;
}