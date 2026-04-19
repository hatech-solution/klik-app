"use client";

import { StoreForm } from "@/components/platform/store-form";
import { useDashboardWorkspace } from "@/components/platform/dashboard-workspace-context";
import { getMessages } from "@/lib/i18n";

export function StoreNewFormClient() {
  const { locale, platform, selectedBot } = useDashboardWorkspace();
  const t = getMessages(locale);

  if (!selectedBot) {
    return <p className="text-sm text-slate-500">{t.dashboard.loadingBots}</p>;
  }

  return <StoreForm locale={locale} platform={platform} selectedBot={selectedBot} mode="create" />;
}
