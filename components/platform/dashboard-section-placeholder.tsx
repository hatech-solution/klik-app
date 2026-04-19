"use client";

import { useDashboardWorkspace } from "@/components/platform/dashboard-workspace-context";
import { getMessages } from "@/lib/i18n";

type Section = "user" | "conversation";

export function DashboardSectionPlaceholder({ section }: { section: Section }) {
  const { locale, platform } = useDashboardWorkspace();
  const t = getMessages(locale);
  const s = t.dashboard.section[section];

  return (
    <article className="space-y-4">
      <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium text-slate-600 ${platform.surfaceClassName}`}>
        {t.dashboard.analytics.mockBadge}
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{s.title}</h2>
      <p className="max-w-2xl text-slate-600">{s.description}</p>
      <p className="text-sm text-slate-500">{t.dashboard.sectionPlaceholder}</p>
    </article>
  );
}
