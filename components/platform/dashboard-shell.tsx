"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DashboardWorkspaceProvider } from "@/components/platform/dashboard-workspace-context";
import { usePlatformBotWorkspace } from "@/components/platform/use-platform-bot-workspace";
import {
  DashboardShellBotsSkeleton,
  DashboardShellRedirectSkeleton,
  LoadingRegion,
} from "@/components/ui/screen-loading-skeletons";
import { DASHBOARD_MAIN_NAV, dashboardNavHref } from "@/lib/constants/dashboard-nav";
import type { Locale } from "@/lib/i18n";

type DashboardShellProps = {
  locale: Locale;
  children: React.ReactNode;
};

export function DashboardShell({ locale, children }: DashboardShellProps) {
  const pathname = usePathname() ?? "";
  const ws = usePlatformBotWorkspace(locale, "dashboardShell");

  const {
    platformHydrated,
    platform,
    bots,
    selectedBotId,
    setSelectedBotId,
    selectedBot,
    errorMessage,
    isLoadingBots,
    botsListReady,
    t,
  } = ws;

  if (!platformHydrated || !platform) {
    return (
      <main className="dashboard-main">
        <div className="mx-auto w-full max-w-5xl p-6">
          <LoadingRegion aria-label={t.common.loadingScreen} className="mb-8 mt-24">
            <DashboardShellRedirectSkeleton />
          </LoadingRegion>
        </div>
      </main>
    );
  }

  const showRedirectToSelectBot = !selectedBotId && botsListReady;

  const navActiveByHref = (href: string, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const storeScopeMatch = pathname.match(new RegExp(`^/${locale}/store/([^/]+)(?:/.*)?/?$`));
  const storeIdFromPath = storeScopeMatch?.[1];
  const storeBaseHref = storeIdFromPath ? `/${locale}/store/${storeIdFromPath}` : null;
  const backToAdminHref = `/${locale}/store`;

  const sidebarTitle = storeBaseHref ? t.storeDashboard.menuTitle : t.dashboard.menuTitle;
  const navItems = storeBaseHref
    ? [
        { id: "store-overview", href: storeBaseHref, label: t.storeDashboard.navHubSummary, exact: true },
        { id: "store-hours", href: `${storeBaseHref}/hours`, label: t.store.settings.navRouteHours, exact: false },
        { id: "store-staff", href: `${storeBaseHref}/staff`, label: t.store.settings.navRouteStaff, exact: false },
        { id: "store-courses", href: `${storeBaseHref}/courses`, label: t.store.settings.navRouteServices, exact: false },
        {
          id: "store-public-booking",
          href: `${storeBaseHref}/public-booking`,
          label: t.store.settings.navRoutePublicBooking,
          exact: false,
        },
        { id: "store-bookings", href: `${storeBaseHref}/bookings`, label: t.store.settings.navRouteBookings, exact: false },
      ]
    : DASHBOARD_MAIN_NAV.map((item) => {
        const href = dashboardNavHref(locale, item.segment);
        const label =
          item.id === "overview"
            ? t.dashboard.navOverview
            : item.id === "store"
              ? t.dashboard.section.store.title
              : item.id === "user"
                ? t.dashboard.section.user.title
                : t.dashboard.section.conversation.title;
        return { id: item.id, href, label, exact: false };
      });

  return (
    <>
      <main className="dashboard-main">
        <header className={`${platform.headerClassName} dashboard-header`}>
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="flex items-center text-xl font-semibold">
                <img src={platform.logo} alt={platform.name} className="mr-2 h-6 w-6 object-contain" />
                {platform.name} {t.dashboard.titleSuffix}
              </h1>
              <p className="text-sm text-white/90">{t.dashboard.subtitle(platform.name)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm font-medium">{t.dashboard.currentBot}</label>
              <select
                value={selectedBotId}
                onChange={(event) => setSelectedBotId(event.target.value)}
                className="dashboard-bot-select"
              >
                <option value="">{t.dashboard.chooseBot}</option>
                {bots.map((bot) => (
                  <option key={bot.id} value={bot.id}>
                    {bot.name} ({bot.id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {errorMessage ? (
          <div className="mx-auto mt-4 w-full max-w-7xl px-6">
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {errorMessage}
            </div>
          </div>
        ) : null}

        {showRedirectToSelectBot ? (
          <div className="mx-auto w-full max-w-5xl p-6">
            <LoadingRegion aria-label={t.dashboard.loadingBots} className="mb-8 mt-24">
              <DashboardShellRedirectSkeleton />
            </LoadingRegion>
          </div>
        ) : (
          <div className="mx-auto grid w-full max-w-7xl gap-6 p-6 lg:grid-cols-[260px_1fr]">
            <MobileSidebarToggle
              key={pathname}
              sidebarTitle={sidebarTitle}
              storeBaseHref={storeBaseHref}
              backToAdminHref={backToAdminHref}
              backToAdminLabel={t.storeDashboard.backToAdmin}
              navItems={navItems}
              navActiveByHref={navActiveByHref}
              accentClassName={platform.accentClassName}
            />

            <section className="dashboard-content">
              <div className="dashboard-selected-bot mb-6 rounded-xl p-4" data-platform={platform.id}>
                <p className="dashboard-bot-info-text">{t.dashboard.selectedBot}</p>
                <h3 className="dashboard-bot-name">{selectedBot?.name ?? "—"}</h3>
                <p className="dashboard-bot-id">
                  bot_id: {selectedBot?.id ?? "—"}
                </p>
              </div>
              <DashboardWorkspaceProvider value={{ locale, platform, selectedBot }}>
                {isLoadingBots && bots.length === 0 ? (
                  <LoadingRegion aria-label={t.dashboard.loadingBots}>
                    <DashboardShellBotsSkeleton />
                  </LoadingRegion>
                ) : (
                  children
                )}
              </DashboardWorkspaceProvider>
            </section>
          </div>
        )}
      </main>
    </>
  );
}

/* ---------- Mobile sidebar (isolated state, reset via key={pathname}) ---------- */

import { useState } from "react";

type MobileSidebarToggleProps = {
  sidebarTitle: string;
  storeBaseHref: string | null;
  backToAdminHref: string;
  backToAdminLabel: string;
  navItems: { id: string; href: string; label: string; exact: boolean }[];
  navActiveByHref: (href: string, exact: boolean) => boolean;
  accentClassName: string;
};

function MobileSidebarToggle({
  sidebarTitle,
  storeBaseHref,
  backToAdminHref,
  backToAdminLabel,
  navItems,
  navActiveByHref,
  accentClassName,
}: MobileSidebarToggleProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-[var(--dm-border)] bg-[var(--dm-surface)] px-3 py-2 text-sm font-medium text-[var(--dm-text)] shadow-sm lg:hidden"
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        {sidebarTitle}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`ml-auto transition-transform ${open ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <aside className={`dashboard-sidebar ${open ? "" : "hidden"} lg:block`}>
        {storeBaseHref ? (
          <Link
            href={backToAdminHref}
            className="mb-3 inline-flex text-xs font-medium text-[var(--dm-text-muted)] hover:text-[var(--dm-text)]"
          >
            {backToAdminLabel}
          </Link>
        ) : null}
        <h2 className="dashboard-sidebar-title">{sidebarTitle}</h2>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = navActiveByHref(item.href, item.exact);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`dashboard-nav-link ${active ? accentClassName : "inactive"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
