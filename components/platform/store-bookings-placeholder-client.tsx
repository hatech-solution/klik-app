"use client";

import { useStoreSettingsGate } from "@/components/platform/store-settings-context";
import { getMessages, type Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

export function StoreBookingsPlaceholderClient({ locale }: Props) {
  const gate = useStoreSettingsGate();
  const t = getMessages(locale);
  const td = t.storeDashboard;

  if (!gate) {
    return null;
  }

  return (
    <div className="dm-overview-panel space-y-3">
      <h2 className="text-lg font-semibold text-[var(--dm-text)]">{td.bookingsPageTitle}</h2>
      <p className="text-sm text-[var(--dm-text-muted)]">{td.bookingsPlaceholder}</p>
      <p className="text-xs text-[var(--dm-text-muted)]">{td.bookingsHint}</p>
    </div>
  );
}
