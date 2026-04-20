"use client";

import { StoreManagement } from "@/components/platform/store-management";
import { LoadingRegion, StoreManagementPageSkeleton } from "@/components/ui/screen-loading-skeletons";
import { useDashboardWorkspace } from "@/components/platform/dashboard-workspace-context";
import { getMessages } from "@/lib/i18n";

export function StoreManagementRoute() {
  const { locale, platform, selectedBot } = useDashboardWorkspace();
  const t = getMessages(locale);

  if (!selectedBot) {
    return (
      <LoadingRegion aria-label={t.dashboard.loadingBots}>
        <StoreManagementPageSkeleton />
      </LoadingRegion>
    );
  }

  return <StoreManagement locale={locale} platform={platform} selectedBot={selectedBot} />;
}
