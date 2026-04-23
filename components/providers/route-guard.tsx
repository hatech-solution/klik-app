"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { RouteGuardSkeleton } from "@/components/ui/screen-loading-skeletons";
import { DEFAULT_LOCALE, getMessages, isLocale, type Locale } from "@/lib/i18n";
import { usePlatformStore } from "@/store/usePlatformStore";

type RouteGuardProps = {
  children: React.ReactNode;
  locale: string;
};

export const RouteGuard = ({ children, locale }: RouteGuardProps) => {
  const router = useRouter();
  const { loadFromStorage, platformId } = usePlatformStore();
  const [isReady, setIsReady] = useState(false);
  const messagesLocale: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = getMessages(messagesLocale);

  useEffect(() => {
    loadFromStorage();
    const pId = localStorage.getItem("platform_id");

    if (!pId) {
      router.replace(`/${locale}/select-platform`);
      return;
    }
    setIsReady(true);
  }, [router, locale, platformId, loadFromStorage]);

  if (!isReady) {
    return (
      <div className="dm-route-loading">
        <div
          aria-busy="true"
          aria-label={t.common.loadingScreen}
          className="flex w-full max-w-sm flex-col items-center"
          role="status"
        >
          <RouteGuardSkeleton />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
