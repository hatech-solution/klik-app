"use client";

import { DashboardShell } from "@/components/platform/dashboard-shell";
import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  children: React.ReactNode;
};

export function StoreShellLayoutClient({ locale, children }: Props) {
  return <DashboardShell locale={locale}>{children}</DashboardShell>;
}
