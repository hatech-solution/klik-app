"use client";

import { createContext, useContext } from "react";

import type { Locale } from "@/lib/i18n";
import type { PlatformConfig } from "@/lib/platforms";
import type { Bot } from "@/lib/types/bot";

export type DashboardWorkspaceValue = {
  locale: Locale;
  platform: PlatformConfig;
  selectedBot: Bot | undefined;
};

const DashboardWorkspaceContext = createContext<DashboardWorkspaceValue | null>(null);

export function DashboardWorkspaceProvider({
  value,
  children,
}: {
  value: DashboardWorkspaceValue;
  children: React.ReactNode;
}) {
  return <DashboardWorkspaceContext.Provider value={value}>{children}</DashboardWorkspaceContext.Provider>;
}

export function useDashboardWorkspace(): DashboardWorkspaceValue {
  const ctx = useContext(DashboardWorkspaceContext);
  if (!ctx) {
    throw new Error("useDashboardWorkspace must be used inside DashboardWorkspaceProvider");
  }
  return ctx;
}
