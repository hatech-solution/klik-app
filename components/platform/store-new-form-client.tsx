"use client";

import { StoreForm } from "@/components/platform/store-form";
import { DashboardShellBotsSkeleton, LoadingRegion } from "@/components/ui/screen-loading-skeletons";
import { useDashboardWorkspace } from "@/components/platform/dashboard-workspace-context";
import { getMessages } from "@/lib/i18n";

export function StoreNewFormClient() {
  const { locale, platform, selectedBot } = useDashboardWorkspace();
  const t = getMessages(locale);

  if (!selectedBot) {
    return (
      <LoadingRegion aria-label={t.dashboard.loadingBots}>
        <DashboardShellBotsSkeleton />
      </LoadingRegion>
    );
  }

  return <StoreForm locale={locale} platform={platform} selectedBot={selectedBot} mode="create" />;
}
