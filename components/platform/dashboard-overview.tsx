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
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{a.title}</h2>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900 ring-1 ring-amber-200/80">
            {a.mockBadge}
          </span>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">{a.mockNote}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br ${c.tone} p-5 shadow-sm`}
          >
            <p className="text-sm font-medium text-slate-600">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">{c.value}</p>
            <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/40 blur-2xl" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{a.activityChart}</h3>
          <p className="mt-1 text-xs text-slate-500">{a.activityChartHint}</p>
          <div className="mt-6 flex h-40 items-end justify-between gap-2 px-1">
            {barHeights.map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full max-w-10 rounded-t-md bg-gradient-to-t from-slate-200 to-slate-400/90"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] font-medium text-slate-400">{a.weekDaysShort[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{a.quickMetrics}</h3>
          <ul className="mt-4 space-y-4">
            {secondary.map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-slate-600">{row.label}</span>
                <span className="text-lg font-semibold tabular-nums text-slate-900">{row.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
