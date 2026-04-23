"use client";

import Link from "next/link";

import { useStoreSettingsGate } from "@/components/platform/store-settings-context";
import { getMessages, type Locale } from "@/lib/i18n";

const MOCK_STATS = {
  todayBookings: 4,
  weekBookings: 23,
  staffVisible: 5,
} as const;

type StoreDashboardHubProps = {
  locale: Locale;
};

export function StoreDashboardHub({ locale }: StoreDashboardHubProps) {
  const gate = useStoreSettingsGate();
  const t = getMessages(locale);
  const td = t.storeDashboard;

  if (!gate) {
    return null;
  }

  const base = `/${locale}/store/${gate.storeId}`;
  const fmt = locale === "vi" ? "vi-VN" : "en-US";

  const statCards = [
    { label: td.statTodayBookings, value: String(MOCK_STATS.todayBookings), tone: "from-emerald-500/15 to-teal-600/10" },
    { label: td.statWeekBookings, value: String(MOCK_STATS.weekBookings), tone: "from-sky-500/15 to-indigo-600/10" },
    { label: td.statStaffActive, value: String(MOCK_STATS.staffVisible), tone: "from-violet-500/15 to-purple-600/10" },
    {
      label: td.statPublicLink,
      value: td.statPublicLinkValue,
      tone: "from-amber-500/15 to-orange-600/10",
    },
  ] as const;

  const modules: { href: string; title: string; desc: string }[] = [
    { href: `${base}/hours`, title: td.moduleHoursTitle, desc: td.moduleHoursDesc },
    { href: `${base}/staff`, title: td.moduleStaffTitle, desc: td.moduleStaffDesc },
    { href: `${base}/public-booking`, title: td.modulePublicTitle, desc: td.modulePublicDesc },
    { href: `${base}/bookings`, title: td.moduleBookingsTitle, desc: td.moduleBookingsDesc },
    { href: `${base}/courses`, title: td.moduleCoursesTitle, desc: td.moduleCoursesDesc },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--dm-text)]">{gate.store.name}</h2>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-[var(--dm-text-muted)]">{td.hubSubtitle}</p>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-[var(--dm-text)]">{td.analyticsTitle}</h3>
          <span className="dm-mock-badge">{td.mockBadge}</span>
        </div>
        <p className="mb-4 text-xs text-[var(--dm-text-muted)]">{td.mockNote}</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((c) => (
            <div key={c.label} className={`dm-stat-card relative overflow-hidden bg-gradient-to-br ${c.tone}`}>
              <p className="dm-stat-card-label">{c.label}</p>
              <p className="dm-stat-card-value">{c.value}</p>
              <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/25 blur-2xl dark:bg-white/10" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-[var(--dm-text)]">{td.modulesTitle}</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="dm-overview-panel group flex flex-col border border-[var(--dm-border)] transition hover:border-[var(--dm-text-muted)]"
            >
              <p className="text-base font-semibold text-[var(--dm-text)] group-hover:underline">{m.title}</p>
              <p className="mt-2 flex-1 text-sm text-[var(--dm-text-muted)]">{m.desc}</p>
              <span className={`mt-4 inline-flex text-sm font-medium ${gate.platform.accentClassName}`}>
                {td.openModule} →
              </span>
            </Link>
          ))}
        </div>
      </div>

      <p className="text-xs text-[var(--dm-text-muted)]">
        {t.store.timezone}: <span className="font-mono">{gate.store.timezone}</span>
        {` · `}
        {new Intl.DateTimeFormat(fmt, { dateStyle: "medium", timeStyle: "short" }).format(new Date())}
      </p>
    </div>
  );
}
