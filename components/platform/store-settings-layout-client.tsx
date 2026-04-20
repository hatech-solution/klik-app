"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  HOURS_SECTION_IDS,
  STORE_HOURS_SECTIONS_LAYOUT_EVENT,
  mapApiStoreToStore,
  scrollToHoursSection,
  StoreHoursChrome,
} from "@/components/platform/store-operating-hours-view";
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
  const t = getMessages(locale);
  const st = t.store.settings;
  const oh = t.store.operatingHours;
  const { platformId, loadFromStorage } = usePlatformStore();
  const platform = platformId ? PLATFORM_CONFIGS[platformId as PlatformId] : undefined;

  const [botId, setBotId] = useState("");
  const [store, setStore] = useState<Pick<Store, "id" | "name" | "timezone"> | null>(null);
  const [gateLoading, setGateLoading] = useState(true);
  const [gateError, setGateError] = useState<"no_bot" | "not_found" | null>(null);

  const backHref = `/${locale}/overview`;
  const base = `/${locale}/stores/${storeId}/settings`;
  const hoursHref = `${base}/hours`;
  const isHoursRoute = pathname === hoursHref;

  const [activeHoursSection, setActiveHoursSection] = useState<string>(HOURS_SECTION_IDS.intro);
  const prevPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    const prev = prevPathnameRef.current;
    prevPathnameRef.current = pathname;
    const justEnteredHours = pathname === hoursHref && prev !== hoursHref;
    if (!justEnteredHours) return;

    let cancelled = false;
    let done = false;
    const scrollIntro = () => {
      if (cancelled || done) return;
      done = true;
      scrollToHoursSection(HOURS_SECTION_IDS.intro);
    };

    window.addEventListener(STORE_HOURS_SECTIONS_LAYOUT_EVENT, scrollIntro, { once: true });
    const fallback = window.setTimeout(scrollIntro, 480);
    return () => {
      cancelled = true;
      window.removeEventListener(STORE_HOURS_SECTIONS_LAYOUT_EVENT, scrollIntro);
      clearTimeout(fallback);
    };
  }, [pathname, hoursHref]);

  useEffect(() => {
    if (!isHoursRoute) return;

    let cancelled = false;
    let observer: IntersectionObserver | null = null;

    const setupObserver = () => {
      observer?.disconnect();
      observer = null;
      if (cancelled) return;

      const ids = Object.values(HOURS_SECTION_IDS);
      const elements = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => Boolean(el));
      if (elements.length === 0) return;

      observer = new IntersectionObserver(
        (entries) => {
          const sorted = [...entries]
            .filter((e) => e.isIntersecting)
            .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
          const id = sorted[0]?.target?.id;
          if (id) setActiveHoursSection(id);
        },
        { root: null, rootMargin: "-12% 0px -50% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
      );
      elements.forEach((el) => observer!.observe(el));
    };

    const onSectionsLayout = () => setupObserver();
    window.addEventListener(STORE_HOURS_SECTIONS_LAYOUT_EVENT, onSectionsLayout);
    requestAnimationFrame(() => requestAnimationFrame(setupObserver));

    return () => {
      cancelled = true;
      window.removeEventListener(STORE_HOURS_SECTIONS_LAYOUT_EVENT, onSectionsLayout);
      observer?.disconnect();
    };
  }, [isHoursRoute]);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (typeof window === "undefined" || !platform) return;

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
  }, [storeId, platform]);

  useEffect(() => {
    if (!platformId) {
      router.replace(`/${locale}/select-platform`);
    }
  }, [platformId, router, locale]);

  const navLink = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        href={href}
        className={`dm-settings-nav-link ${active ? "dm-settings-nav-link--active" : ""}`}
      >
        {label}
      </Link>
    );
  };

  if (!platform) {
    return (
      <div className="dm-route-loading min-h-screen">
        …
      </div>
    );
  }

  if (gateLoading) {
    return (
      <main className="dm-page-muted min-h-screen">
        <StoreHoursChrome
          locale={locale}
          platform={platform}
          backHref={backHref}
          title={st.pageTitle}
          subtitle={st.pageSubtitle}
        />
        <LoadingRegion aria-label={oh.loading} className="py-6">
          <StoreSettingsGateBodySkeleton />
        </LoadingRegion>
      </main>
    );
  }

  if (gateError === "no_bot") {
    return (
      <main className="dm-page-muted min-h-screen">
        <StoreHoursChrome
          locale={locale}
          platform={platform}
          backHref={backHref}
          title={st.pageTitle}
          subtitle={st.pageSubtitle}
        />
        <div className="mx-auto max-w-7xl px-6 py-12 text-center">
          <p className="text-sm text-[var(--dm-text-secondary)]">{oh.chooseBotFirst}</p>
          <Link
            href={backHref}
            className={`mt-4 inline-block rounded-lg px-4 py-2 text-sm font-medium text-white ${platform.accentClassName} ${platform.hoverClassName}`}
          >
            {oh.backToDashboard}
          </Link>
        </div>
      </main>
    );
  }

  if (gateError === "not_found" || !store) {
    return (
      <main className="dm-page-muted min-h-screen">
        <StoreHoursChrome
          locale={locale}
          platform={platform}
          backHref={backHref}
          title={st.pageTitle}
          subtitle={st.pageSubtitle}
        />
        <div className="mx-auto max-w-7xl px-6 py-12 text-center">
          <p className="text-sm text-red-600 dark:text-red-300">{oh.storeNotFound}</p>
          <Link href={backHref} className="dm-link-accent mt-4 inline-block text-sm underline">
            {oh.backToDashboard}
          </Link>
        </div>
      </main>
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
    backHref,
  };

  return (
    <StoreSettingsGateProvider value={gate}>
      <main className="dm-page-muted min-h-screen">
        <StoreHoursChrome
          locale={locale}
          platform={platform}
          backHref={backHref}
          title={st.pageTitle}
          subtitle={`${store.name} · ${st.pageSubtitle}`}
        />
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-64 lg:self-start">
            <nav className="dm-settings-nav" aria-label={st.routeNavAriaLabel}>
              <div className="dm-settings-nav-head">
                <p className="dm-settings-nav-title">{st.pageTitle}</p>
                <p className="dm-settings-nav-hint">{st.specHint}</p>
              </div>
              <div className="mt-2 flex flex-col gap-0.5">
                <div className="rounded-lg">
                  <Link
                    href={hoursHref}
                    scroll={false}
                    aria-expanded={isHoursRoute}
                    onClick={() => {
                      if (pathname === hoursHref) {
                        scrollToHoursSection(HOURS_SECTION_IDS.intro);
                      }
                    }}
                    className={`dm-settings-nav-link flex items-center justify-between gap-2 ${
                      isHoursRoute ? "dm-settings-nav-link--active" : ""
                    }`}
                  >
                    <span className="min-w-0 flex-1">{st.navRouteHours}</span>
                    <span
                      className={`shrink-0 ${isHoursRoute ? "text-[var(--dm-text-muted)]" : "text-[var(--dm-text-muted)]"}`}
                      aria-hidden
                    >
                      {isHoursRoute ? <ChevronDownNavIcon /> : <ChevronRightNavIcon />}
                    </span>
                  </Link>
                  {isHoursRoute ? (
                    <div
                      id="store-settings-hours-subnav"
                      className="dm-settings-subnav mt-0.5 space-y-px pt-1"
                      role="group"
                      aria-label={oh.navPageTitle}
                    >
                      {(
                        [
                          [HOURS_SECTION_IDS.intro, oh.navItemIntro],
                          [HOURS_SECTION_IDS.mode, oh.navItemMode],
                          [HOURS_SECTION_IDS.schedule, oh.navItemSchedule],
                          [HOURS_SECTION_IDS.overrides, oh.navItemOverrides],
                          [HOURS_SECTION_IDS.preview, oh.navItemPreview],
                          [HOURS_SECTION_IDS.actions, oh.navItemActions],
                        ] as const
                      ).map(([id, label]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            scrollToHoursSection(id);
                            setActiveHoursSection(id);
                          }}
                          className={`dm-settings-subnav-btn ${
                            activeHoursSection === id ? "dm-settings-subnav-btn--active" : ""
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                {navLink(`${base}/staff`, st.navRouteStaff)}
                {navLink(`${base}/services`, st.navRouteServices)}
                {navLink(`${base}/public-booking`, st.navRoutePublicBooking)}
              </div>
            </nav>
          </aside>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </main>
    </StoreSettingsGateProvider>
  );
}

function ChevronRightNavIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ChevronDownNavIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
