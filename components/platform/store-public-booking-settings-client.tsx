"use client";

import { useCallback, useEffect, useState } from "react";

import { useStoreSettingsGate } from "@/components/platform/store-settings-context";
import { LoadingRegion, StorePublicBookingSettingsBodySkeleton } from "@/components/ui/screen-loading-skeletons";
import {
  fetchPublicBookingSettings,
  putPublicBookingSettings,
} from "@/lib/api/store/client";
import type { PublicBookingCalendarViewMode } from "@/lib/api/store/types";
import { ApiClientError, getErrorMessageByKey } from "@/lib/api/error";
import { getMessages, type Locale } from "@/lib/i18n";
import { notifyError, notifySuccess } from "@/lib/toast";

type Props = {
  locale: Locale;
};

function toNullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function parseWholeNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
}

export function StorePublicBookingSettingsClient({ locale }: Props) {
  const gate = useStoreSettingsGate();
  const t = getMessages(locale);
  const pb = t.store.publicBooking;
  const errorByKey = t.store.errorByKey as Record<string, string>;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const [calendarViewMode, setCalendarViewMode] = useState<PublicBookingCalendarViewMode>("month");
  const [slotStepHours, setSlotStepHours] = useState("0");
  const [slotStepMinutes, setSlotStepMinutes] = useState("30");
  const [urlBookingComplete, setURLBookingComplete] = useState("");
  const [urlBookingUpdated, setURLBookingUpdated] = useState("");
  const [urlBookingCancelled, setURLBookingCancelled] = useState("");

  const load = useCallback(async () => {
    if (!gate) return;
    setLoading(true);
    setBanner(null);
    try {
      const row = await fetchPublicBookingSettings(gate.botId, gate.storeId);
      setCalendarViewMode(row.calendar_view_mode);
      setSlotStepHours(String(row.slot_step_hours));
      setSlotStepMinutes(String(row.slot_step_minutes));
      setURLBookingComplete(row.url_booking_complete ?? "");
      setURLBookingUpdated(row.url_booking_updated ?? "");
      setURLBookingCancelled(row.url_booking_cancelled ?? "");
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? getErrorMessageByKey(err, pb.loadFailed, errorByKey)
          : pb.loadFailed;
      setBanner(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  }, [gate, pb.loadFailed, errorByKey]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveSettings() {
    if (!gate) return;
    const hours = parseWholeNumber(slotStepHours);
    const minutes = parseWholeNumber(slotStepMinutes);
    if (
      hours == null ||
      minutes == null ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 55 ||
      minutes % 5 !== 0 ||
      (hours === 0 && minutes === 0)
    ) {
      setBanner(pb.slotStepInvalid);
      return;
    }

    setSaving(true);
    setBanner(null);
    try {
      const next = await putPublicBookingSettings(gate.botId, gate.storeId, {
        calendar_view_mode: calendarViewMode,
        slot_step_hours: hours,
        slot_step_minutes: minutes,
        url_booking_complete: toNullableText(urlBookingComplete),
        url_booking_updated: toNullableText(urlBookingUpdated),
        url_booking_cancelled: toNullableText(urlBookingCancelled),
      });
      setCalendarViewMode(next.calendar_view_mode);
      setSlotStepHours(String(next.slot_step_hours));
      setSlotStepMinutes(String(next.slot_step_minutes));
      setURLBookingComplete(next.url_booking_complete ?? "");
      setURLBookingUpdated(next.url_booking_updated ?? "");
      setURLBookingCancelled(next.url_booking_cancelled ?? "");
      notifySuccess(t.toast.publicBookingSettingsSaved);
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? getErrorMessageByKey(err, pb.saveFailed, errorByKey)
          : pb.saveFailed;
      setBanner(message);
    } finally {
      setSaving(false);
    }
  }

  if (!gate) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-(--dm-text)">{pb.pageTitle}</h2>
        <p className="mt-1 text-sm text-(--dm-text-muted)">{pb.pageSubtitle}</p>
      </div>

      {banner ? <div className="dm-form-error-banner">{banner}</div> : null}

      {loading ? (
        <section className="dm-overview-panel">
          <LoadingRegion aria-label={pb.loading} className="p-4 sm:p-6">
            <StorePublicBookingSettingsBodySkeleton />
          </LoadingRegion>
        </section>
      ) : (
        <section className="dm-overview-panel space-y-5">
          <div>
            <label className="dm-label mb-1 block text-xs" htmlFor="calendar-view-mode">
              {pb.calendarViewMode}
            </label>
            <select
              id="calendar-view-mode"
              value={calendarViewMode}
              onChange={(e) => setCalendarViewMode(e.target.value as PublicBookingCalendarViewMode)}
              className="dm-input max-w-sm"
            >
              <option value="month">{pb.calendarViewMonth}</option>
              <option value="week">{pb.calendarViewWeek}</option>
            </select>
          </div>

          <div>
            <p className="dm-label mb-1 block text-xs">{pb.slotStepLabel}</p>
            <div className="grid max-w-lg gap-3 sm:grid-cols-2">
              <input
                type="number"
                min={0}
                max={23}
                step={1}
                value={slotStepHours}
                onChange={(e) => setSlotStepHours(e.target.value)}
                className="dm-input"
                placeholder={pb.slotStepHours}
              />
              <input
                type="number"
                min={0}
                max={55}
                step={5}
                value={slotStepMinutes}
                onChange={(e) => setSlotStepMinutes(e.target.value)}
                className="dm-input"
                placeholder={pb.slotStepMinutes}
              />
            </div>
            <p className="mt-1 text-xs text-(--dm-text-muted)">{pb.slotStepHint}</p>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="dm-label mb-1 block text-xs" htmlFor="url-booking-complete">
                {pb.urlBookingComplete}
              </label>
              <input
                id="url-booking-complete"
                type="url"
                value={urlBookingComplete}
                onChange={(e) => setURLBookingComplete(e.target.value)}
                className="dm-input"
                placeholder="https://example.com/complete"
              />
            </div>

            <div>
              <label className="dm-label mb-1 block text-xs" htmlFor="url-booking-updated">
                {pb.urlBookingUpdated}
              </label>
              <input
                id="url-booking-updated"
                type="url"
                value={urlBookingUpdated}
                onChange={(e) => setURLBookingUpdated(e.target.value)}
                className="dm-input"
                placeholder="https://example.com/updated"
              />
            </div>

            <div>
              <label className="dm-label mb-1 block text-xs" htmlFor="url-booking-cancelled">
                {pb.urlBookingCancelled}
              </label>
              <input
                id="url-booking-cancelled"
                type="url"
                value={urlBookingCancelled}
                onChange={(e) => setURLBookingCancelled(e.target.value)}
                className="dm-input"
                placeholder="https://example.com/cancelled"
              />
            </div>
            <p className="text-xs text-(--dm-text-muted)">{pb.urlHint}</p>
          </div>

          <div>
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveSettings()}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${gate.platform.accentClassName} ${gate.platform.hoverClassName}`}
            >
              {saving ? "…" : pb.save}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
