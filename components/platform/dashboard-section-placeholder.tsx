"use client";

import { useDashboardWorkspace } from "@/components/platform/dashboard-workspace-context";
import { getMessages } from "@/lib/i18n";

type Section = "user" | "conversation";

export function DashboardSectionPlaceholder({ section }: { section: Section }) {
  const { locale } = useDashboardWorkspace();
  const t = getMessages(locale);
  const s = t.dashboard.section[section];

  return (
    <article className="space-y-4">
      <div className="dm-section-badge">{t.dashboard.analytics.mockBadge}</div>
      <h2 className="text-2xl font-semibold tracking-tight text-[var(--dm-text)]">{s.title}</h2>
      <p className="max-w-2xl text-[var(--dm-text-muted)]">{s.description}</p>
      <p className="text-sm text-[var(--dm-text-muted)]">{t.dashboard.sectionPlaceholder}</p>
    </article>
  );
}
