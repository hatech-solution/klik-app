"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { mapApiStoreToStore } from "@/components/platform/store-operating-hours-view";
import { LoadingRegion, StoreSettingsGateBodySkeleton } from "@/components/ui/screen-loading-skeletons";
import { StoreSettingsGateProvider } from "@/components/platform/store-settings-context";
import { fetchStores } from "@/lib/api/store/client";
import { getMessages, type Locale } from "@/lib/i18n";
import { PlatformId, PLATFORM_CONFIGS, type PlatformConfig } from "@/lib/platforms";
import type { Store } from "@/lib/types/store";
import { usePlatformStore } from "@/store/usePlatformStore";

const SESSION_BOT_STORAGE_KEY = "bot_id";

type Props = {
  locale: Locale;
  storeId: string;
  children: React.ReactNode;
};

export function StoreSettingsLayoutClient({ locale, storeId, children }: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const isStoreProfileEdit = pathname === `/${locale}/store/${storeId}/edit`;

  const t = getMessages(locale);
  const { platformId, loadFromStorage } = usePlatformStore();
  const platform = platformId ? PLATFORM_CONFIGS[platformId as PlatformId] : undefined;
  const [platformHydrated, setPlatformHydrated] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem("platform_id"));
  });

  const [botId, setBotId] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(SESSION_BOT_STORAGE_KEY) ?? "";
  });
  const [store, setStore] = useState<Pick<Store, "id" | "name" | "timezone"> | null>(null);
  const [gateLoading, setGateLoading] = useState(true);
  const [gateError, setGateError] = useState<"no_bot" | "not_found" | null>(null);

  const listBackHref = `/${locale}/store`;
  const overviewHref = `/${locale}/overview`;

  useEffect(() => {
    loadFromStorage();
    setPlatformHydrated(true);
  }, [loadFromStorage]);

  useEffect(() => {
    if (typeof window === "undefined" || !platform || !platformHydrated) return;

    const id = localStorage.getItem(SESSION_BOT_STORAGE_KEY) ?? "";
    setBotId(id);
    if (!id) {
      setGateError("no_bot");
      setGateLoading(false);
      return;
    }

    let cancelled = false;
    setGateLoading(true);
    setGateError(null);

    void (async () => {
      try {
        const rows = await fetchStores(id);
        if (cancelled) return;
        const mapped = rows.map(mapApiStoreToStore);
        const found = mapped.find((s) => s.id === storeId);
        if (!found) {
          setGateError("not_found");
          setStore(null);
        } else {
          setStore({
            id: found.id,
            name: found.name,
            timezone: found.timezone,
          });
        }
      } catch {
        if (!cancelled) {
          setGateError("not_found");
          setStore(null);
        }
      } finally {
        if (!cancelled) setGateLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [storeId, platform, platformHydrated]);

  useEffect(() => {
    if (!platformHydrated) return;
    if (!platformId) {
      router.replace(`/${locale}/select-platform`);
    }
  }, [platformHydrated, platformId, router, locale]);

  // Sửa hồ sơ store dùng luồng riêng (DashboardWorkspace), không cần gate.
  if (isStoreProfileEdit) {
    return <>{children}</>;
  }

  if (!platform) {
    return (
      <div className="dm-route-loading min-h-screen">
        …
      </div>
    );
  }

  if (gateLoading) {
    return (
      <LoadingRegion aria-label={t.storeDashboard.ariaLoadingHub} className="py-2">
        <StoreSettingsGateBodySkeleton />
      </LoadingRegion>
    );
  }

  if (gateError === "no_bot") {
    return (
      <div className="rounded-xl border border-[var(--dm-border)] bg-[var(--dm-surface)] px-6 py-8 text-center">
        <p className="text-sm text-(--dm-text-secondary)">{t.store.operatingHours.chooseBotFirst}</p>
        <Link
          href={overviewHref}
          className={`mt-4 inline-block rounded-lg px-4 py-2 text-sm font-medium text-white ${platform.accentClassName} ${platform.hoverClassName}`}
        >
          {t.store.operatingHours.backToDashboard}
        </Link>
      </div>
    );
  }

  if (gateError === "not_found" || !store) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center dark:border-red-900/40 dark:bg-red-950/20">
        <p className="text-sm text-red-600 dark:text-red-300">{t.store.operatingHours.storeNotFound}</p>
        <Link href={listBackHref} className="dm-link-accent mt-4 inline-block text-sm underline">
          {t.store.backToStoreList}
        </Link>
      </div>
    );
  }

  const gate: {
    locale: Locale;
    storeId: string;
    platform: PlatformConfig;
    botId: string;
    store: Pick<Store, "id" | "name" | "timezone">;
    backHref: string;
  } = {
    locale,
    storeId,
    platform,
    botId,
    store,
    backHref: `/${locale}/store/${storeId}`,
  };

  return <StoreSettingsGateProvider value={gate}>{children}</StoreSettingsGateProvider>;
}
