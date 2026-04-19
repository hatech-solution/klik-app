"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { StoreForm } from "@/components/platform/store-form";
import { useDashboardWorkspace } from "@/components/platform/dashboard-workspace-context";
import { fetchStores } from "@/lib/api/store/client";
import { mapStoreApiItemToStore } from "@/lib/api/store/map-store";
import { getMessages, type Locale } from "@/lib/i18n";
import type { Store } from "@/lib/types/store";

type Props = {
  locale: Locale;
  storeId: string;
};

export function StoreEditFormClient({ locale, storeId }: Props) {
  const { platform, selectedBot } = useDashboardWorkspace();
  const t = getMessages(locale);
  const listHref = `/${locale}/dashboard/store`;

  const [phase, setPhase] = useState<"loading" | "ready" | "missing">("loading");
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    if (!selectedBot) return;
    let cancelled = false;
    setPhase("loading");
    void (async () => {
      try {
        const rows = await fetchStores(selectedBot.id);
        if (cancelled) return;
        const mapped = rows.map(mapStoreApiItemToStore);
        const found = mapped.find((s) => s.id === storeId) ?? null;
        setStore(found);
        setPhase(found ? "ready" : "missing");
      } catch {
        if (!cancelled) setPhase("missing");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedBot, storeId]);

  if (!selectedBot) {
    return <p className="text-sm text-slate-500">{t.dashboard.loadingBots}</p>;
  }

  if (phase === "loading") {
    return <p className="text-sm text-slate-500">{t.store.loadingStoreList}</p>;
  }

  if (phase === "missing" || !store) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">{t.store.storeFormEditNotFound}</p>
        <Link href={listHref} className="text-sm font-medium text-slate-700 underline hover:text-slate-900">
          {t.store.backToStoreList}
        </Link>
      </div>
    );
  }

  return (
    <StoreForm
      locale={locale}
      platform={platform}
      selectedBot={selectedBot}
      mode="edit"
      initialStore={store}
    />
  );
}
