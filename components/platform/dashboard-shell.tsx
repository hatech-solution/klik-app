"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DashboardWorkspaceProvider } from "@/components/platform/dashboard-workspace-context";
import { usePlatformBotWorkspace } from "@/components/platform/use-platform-bot-workspace";
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
    if (!segment) return pathname === href || pathname === `${href}/`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <main className="min-h-screen bg-slate-50/80">
        <header className={`${platform.headerClassName} border-b px-6 py-4 shadow-sm`}>
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
                className="min-w-56 rounded-lg border border-white/30 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
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
            <div className="mb-8 mt-24 text-center text-sm text-slate-500">{t.dashboard.loadingBots}</div>
          </div>
        ) : (
          <div className="mx-auto grid w-full max-w-7xl gap-6 p-6 lg:grid-cols-[260px_1fr]">
            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
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
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                        active
                          ? `${platform.accentClassName}`
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {labelKey}
                    </Link>
                  );
                })}
              </nav>
            </aside>

            <section className="min-h-[480px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className={`mb-6 rounded-xl border p-4 ${platform.surfaceClassName}`}>
                <p className="text-sm text-slate-700">{t.dashboard.selectedBot}</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{selectedBot?.name ?? "—"}</h3>
                <p className="font-mono text-sm text-slate-600">
                  bot_id: {selectedBot?.id ?? "—"}
                </p>
              </div>
              <DashboardWorkspaceProvider value={{ locale, platform, selectedBot }}>
                {isLoadingBots && bots.length === 0 ? (
                  <p className="text-sm text-slate-500">{t.dashboard.loadingBots}</p>
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
