"use client";

import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/i18n";

/** Số liệu minh hoạ khi chưa nối API thống kê. */
const MOCK_ANALYTICS = {
  stores: 12,
  users: 1842,
  conversations: 96,
  messagesToday: 428,
  openThreads: 23,
  avgFirstResponseSec: 41,
  satisfactionPct: 91,
  weekTrendPct: 6.2,
} as const;

type DashboardOverviewProps = {
  locale: Locale;
};

export function DashboardOverview({ locale }: DashboardOverviewProps) {
  const t = getMessages(locale);
  const a = t.dashboard.analytics;

  const cards = [
    { label: a.stores, value: MOCK_ANALYTICS.stores, tone: "from-emerald-500/15 to-teal-600/10" },
    { label: a.users, value: MOCK_ANALYTICS.users.toLocaleString(locale === "vi" ? "vi-VN" : "en-US"), tone: "from-sky-500/15 to-indigo-600/10" },
    { label: a.conversations, value: MOCK_ANALYTICS.conversations, tone: "from-violet-500/15 to-purple-600/10" },
    { label: a.messagesToday, value: MOCK_ANALYTICS.messagesToday.toLocaleString(locale === "vi" ? "vi-VN" : "en-US"), tone: "from-amber-500/15 to-orange-600/10" },
  ] as const;

  const secondary = [
    { label: a.openThreads, value: String(MOCK_ANALYTICS.openThreads) },
    { label: a.avgFirstResponse, value: `${MOCK_ANALYTICS.avgFirstResponseSec}s` },
    { label: a.satisfaction, value: `${MOCK_ANALYTICS.satisfactionPct}%` },
    { label: a.weekTrend, value: `+${MOCK_ANALYTICS.weekTrendPct}%` },
  ] as const;

  const barHeights = [44, 72, 56, 88, 64, 92, 58] as const;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--dm-text)]">{a.title}</h2>
          <span className="dm-mock-badge">{a.mockBadge}</span>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-[var(--dm-text-muted)]">{a.mockNote}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`dm-stat-card bg-gradient-to-br ${c.tone}`}
          >
            <p className="dm-stat-card-label">{c.label}</p>
            <p className="dm-stat-card-value">{c.value}</p>
            <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/25 blur-2xl dark:bg-white/10" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="dm-overview-panel lg:col-span-3">
          <h3 className="dm-section-heading">{a.activityChart}</h3>
          <p className="mt-1 text-xs text-[var(--dm-text-muted)]">{a.activityChartHint}</p>
          <div className="mt-6 flex h-40 items-end justify-between gap-2 px-1">
            {barHeights.map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="dm-chart-bar" style={{ height: `${h}%` }} />
                <span className="dm-chart-day">{a.weekDaysShort[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dm-overview-panel-muted lg:col-span-2">
          <h3 className="dm-section-heading">{a.quickMetrics}</h3>
          <ul className="mt-4 space-y-4">
            {secondary.map((row) => (
              <li key={row.label} className="dm-metric-row">
                <span className="dm-metric-label">{row.label}</span>
                <span className="dm-metric-value">{row.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
