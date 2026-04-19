"use client";

import { createContext, useContext } from "react";

import type { Locale } from "@/lib/i18n";
import type { PlatformConfig } from "@/lib/platforms";
import type { Store } from "@/lib/types/store";

export type StoreSettingsGateValue = {
  locale: Locale;
  storeId: string;
  platform: PlatformConfig;
  botId: string;
  store: Pick<Store, "id" | "name" | "timezone">;
  backHref: string;
};

const StoreSettingsGateContext = createContext<StoreSettingsGateValue | null>(null);

export function StoreSettingsGateProvider({
  value,
  children,
}: {
  value: StoreSettingsGateValue | null;
  children: React.ReactNode;
}) {
  return (
    <StoreSettingsGateContext.Provider value={value}>{children}</StoreSettingsGateContext.Provider>
  );
}

export function useStoreSettingsGate(): StoreSettingsGateValue | null {
  return useContext(StoreSettingsGateContext);
}
