"use client";

import { useStoreSettingsGate } from "@/components/platform/store-settings-context";
import { getMessages } from "@/lib/i18n";

type Kind = "staff" | "services" | "public";

export function StoreSettingsRoutePlaceholder({ kind }: { kind: Kind }) {
  const ctx = useStoreSettingsGate();
  if (!ctx) return null;

  const { locale } = ctx;
  const st = getMessages(locale).store.settings;
  const oh = getMessages(locale).store.operatingHours;

  const title =
    kind === "staff"
      ? oh.navSection2
      : kind === "services"
        ? oh.navSection3
        : oh.navSection4;
  const body =
    kind === "staff"
      ? st.placeholderStaff
      : kind === "services"
        ? st.placeholderCourse
        : st.placeholderPublic;

  return (
    <section className="dm-panel p-8">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 text-sm text-slate-600">{body}</p>
      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">{st.placeholderTitle}</p>
    </section>
  );
}
