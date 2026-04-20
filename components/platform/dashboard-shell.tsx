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

  if (!platform) return null;

  const showRedirectToSelectBot = !selectedBotId && botsListReady;

  const navActive = (segment: string) => {
    const href = dashboardNavHref(locale, segment);
    return pathname === href || pathname.startsWith(`${href}/`);
  };

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
            <aside className="dashboard-sidebar">
              <h2 className="dashboard-sidebar-title">
                {t.dashboard.menuTitle}
              </h2>
              <nav className="space-y-2">
                {DASHBOARD_MAIN_NAV.map((item) => {
                  const href = dashboardNavHref(locale, item.segment);
                  const active = navActive(item.segment);
                  const labelKey =
                    item.id === "overview"
                      ? t.dashboard.navOverview
                      : item.id === "store"
                        ? t.dashboard.section.store.title
                        : item.id === "user"
                          ? t.dashboard.section.user.title
                          : t.dashboard.section.conversation.title;
                  return (
                    <Link
                      key={item.id}
                      href={href}
                      className={`dashboard-nav-link ${
                        active
                          ? platform.accentClassName
                          : "inactive"
                      }`}
                    >
                      {labelKey}
                    </Link>
                  );
                })}
              </nav>
            </aside>

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
