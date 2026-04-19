"use client";

import { StoreManagement } from "@/components/platform/store-management";
import { useDashboardWorkspace } from "@/components/platform/dashboard-workspace-context";
import { getMessages } from "@/lib/i18n";

export function StoreManagementRoute() {
  const { locale, platform, selectedBot } = useDashboardWorkspace();
  const t = getMessages(locale);

  if (!selectedBot) {
    return <p className="text-sm text-slate-500">{t.dashboard.loadingBots}</p>;
  }

  return <StoreManagement locale={locale} platform={platform} selectedBot={selectedBot} />;
}
