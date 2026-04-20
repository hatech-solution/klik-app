"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";

import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/i18n";
import type { PlatformConfig } from "@/lib/platforms";
import type {
  Store,
  StoreBusinessStatus,
  StoreVerificationStatus,
} from "@/lib/types/store";
import {
  fetchStaffOperatingHours,
  fetchStoreOperatingHours,
  putStaffOperatingHours,
  putStoreOperatingHours,
  resolveStaffOperatingHours,
  resolveStoreOperatingHours,
} from "@/lib/api/store/client";
import type { StoreApiItem } from "@/lib/api/store/types";
import type {
  PutStoreOperatingHoursPayload,
  StaffHoursScope,
  StoreCalendarOverride,
  StoreDayKind,
  StoreHolidayFallbackDayKind,
  StoreHoursMode,
  StoreOperatingHoursSegment,
  StoreWeekdayRule,
} from "@/lib/api/store/types";
import { LoadingRegion, StoreOperatingHoursBodySkeleton } from "@/components/ui/screen-loading-skeletons";
import { ApiClientError, getErrorMessageByKey } from "@/lib/api/error";
import { notifyApiFailure, notifySuccess } from "@/lib/toast";
import {
  useStoreSettingsGate,
  type StoreSettingsGateValue,
} from "@/components/platform/store-settings-context";

export const HOURS_SECTION_IDS = {
  intro: "store-hours-intro",
  mode: "store-hours-mode",
  schedule: "store-hours-schedule",
  overrides: "store-hours-overrides",
  preview: "store-hours-preview",
  actions: "store-hours-actions",
} as const;

/** Cuộn tới mục §1; chờ layout/paint để `scroll-margin` áp dụng ổn định. */
export function scrollToHoursSection(sectionId: string) {
  const run = () => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  };
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });
  });
}

/** Layout sidebar bắt sự kiện này để gắn lại IntersectionObserver (sau load / đổi mode). */
export const STORE_HOURS_SECTIONS_LAYOUT_EVENT = "klik:store-hours-sections-layout";

export function StoreHoursChrome({
  locale,
  platform,
  backHref,
  title,
  subtitle,
}: {
  locale: Locale;
  platform: PlatformConfig;
  backHref: string;
  title: string;
  subtitle?: string;
}) {
  const oh = getMessages(locale).store.operatingHours;
  return (
    <header className={`${platform.headerClassName} border-b px-4 py-4 shadow-sm sm:px-6`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={backHref}
              className="shrink-0 rounded-lg border border-white/30 px-2 py-1 text-sm text-white/95 hover:bg-white/10"
            >
              ← {oh.backToDashboard}
            </Link>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-white">{title}</h1>
              {subtitle ? (
                <p className="truncate text-xs font-normal text-white/80">{subtitle}</p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/90">
          {/* eslint-disable-next-line @next/next/no-img-element -- khớp dashboard nền tảng */}
          <img src={platform.logo} alt="" className="h-5 w-5 object-contain" />
          <span>{platform.name}</span>
        </div>
      </div>
    </header>
  );
}

export function mapApiStoreToStore(d: StoreApiItem): Store {
  return {
    id: d.id,
    name: d.name,
    regionCode: d.region_code,
    timezone: d.timezone,
    currencyCode: d.currency_code,
    address: d.address,
    phoneNumber: d.phone_number,
    email: d.email,
    description: d.description,
    primaryImageUrl: d.primary_image_url,
    slideImageUrls: d.slide_image_urls,
    youtubeUrl: d.youtube_url,
    facebookUrl: d.facebook_url,
    googleMapUrl: d.google_map_url,
    websiteUrl: d.website_url,
    businessStatus: d.business_status as StoreBusinessStatus,
    verificationStatus: d.verification_status as StoreVerificationStatus,
  };
}

type LocalSegment = StoreOperatingHoursSegment & { _key: string };
type LocalWeekdayRule = {
  weekday: number;
  day_kind: StoreDayKind;
  segments: LocalSegment[];
};
type LocalOverride = {
  _key: string;
  calendar_date: string;
  day_kind: StoreDayKind;
  segments: LocalSegment[];
};

function newKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function segFromApi(s: StoreOperatingHoursSegment): LocalSegment {
  return { ...s, _key: newKey() };
}

function defaultSegment(): LocalSegment {
  return { start: "09:00", end: "18:00", is_overnight: false, _key: newKey() };
}

function emptyWeekdayRules(): LocalWeekdayRule[] {
  return Array.from({ length: 7 }, (_, i) => ({
    weekday: i + 1,
    day_kind: "closed" as const,
    segments: [],
  }));
}

function apiRulesToLocal(rules: StoreWeekdayRule[]): LocalWeekdayRule[] {
  const sorted = [...rules].sort((a, b) => a.weekday - b.weekday);
  const byWd = new Map(sorted.map((r) => [r.weekday, r]));
  return Array.from({ length: 7 }, (_, i) => {
    const wd = i + 1;
    const r = byWd.get(wd);
    if (!r) {
      return { weekday: wd, day_kind: "closed", segments: [] };
    }
    return {
      weekday: wd,
      day_kind: r.day_kind,
      segments: (r.segments ?? []).map(segFromApi),
    };
  });
}

function localOverridesFromApi(overrides: StoreCalendarOverride[]): LocalOverride[] {
  return overrides.map((o) => ({
    _key: newKey(),
    calendar_date: o.calendar_date,
    day_kind: o.day_kind,
    segments: (o.segments ?? []).map(segFromApi),
  }));
}

function stripLocalSegment(s: LocalSegment): StoreOperatingHoursSegment {
  return { start: s.start.trim(), end: s.end.trim(), is_overnight: s.is_overnight };
}

function buildPutPayload(
  hoursMode: StoreHoursMode,
  holidayFallback: StoreHolidayFallbackDayKind,
  byWeekday: LocalWeekdayRule[],
  common: LocalWeekdayRule,
  overrides: LocalOverride[],
): PutStoreOperatingHoursPayload {
  const mapRule = (r: LocalWeekdayRule): StoreWeekdayRule => ({
    weekday: r.weekday,
    day_kind: r.day_kind,
    segments:
      r.day_kind === "segments" ? r.segments.map(stripLocalSegment) : [],
  });

  let weekday_rules: StoreWeekdayRule[];
  if (hoursMode === "weekly_common") {
    const template = mapRule({ ...common, weekday: 1 });
    weekday_rules = Array.from({ length: 7 }, (_, i) => ({
      ...template,
      weekday: i + 1,
    }));
  } else {
    weekday_rules = byWeekday.map(mapRule);
  }

  const calendar_overrides: StoreCalendarOverride[] = overrides.map((o) => ({
    calendar_date: o.calendar_date.trim(),
    day_kind: o.day_kind,
    segments: o.day_kind === "segments" ? o.segments.map(stripLocalSegment) : [],
  }));

  return {
    hours_mode: hoursMode,
    holiday_fallback_day_kind: holidayFallback,
    weekday_rules,
    calendar_overrides,
  };
}

function todayYmd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function StoreOperatingHoursEditor(props?: { staffId?: string }) {
  const staffId = props?.staffId;
  const ctx = useStoreSettingsGate();
  if (!ctx) return null;
  return <StoreOperatingHoursEditorInner {...ctx} staffId={staffId} />;
}

function StoreOperatingHoursEditorInner({
  locale,
  platform,
  botId,
  store,
  backHref,
  staffId,
}: StoreSettingsGateValue & { staffId?: string }) {
  const t = getMessages(locale);
  const oh = t.store.operatingHours;
  const errorByKey = t.store.errorByKey as Record<string, string>;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const [hoursMode, setHoursMode] = useState<StoreHoursMode>("by_weekday");
  const [holidayFallback, setHolidayFallback] =
    useState<StoreHolidayFallbackDayKind>("closed");
  const [byWeekday, setByWeekday] = useState<LocalWeekdayRule[]>(emptyWeekdayRules);
  const [common, setCommon] = useState<LocalWeekdayRule>(() => ({
    weekday: 1,
    day_kind: "segments",
    segments: [defaultSegment()],
  }));
  const [overrides, setOverrides] = useState<LocalOverride[]>([]);
  const [configured, setConfigured] = useState(false);

  const [resolveFrom, setResolveFrom] = useState(todayYmd);
  const [resolveTo, setResolveTo] = useState(() => addDaysYmd(todayYmd(), 13));
  const [resolveLoading, setResolveLoading] = useState(false);
  const [resolveRows, setResolveRows] = useState<
    Awaited<ReturnType<typeof resolveStoreOperatingHours>>["days"] | null
  >(null);
  const [staffHoursScope, setStaffHoursScope] = useState<StaffHoursScope>("inherit_store");

  const baseId = useId();
  const scheduleLocked = Boolean(staffId && staffHoursScope === "inherit_store");
  const staffListHref = `/${locale}/stores/${store.id}/settings/staff`;

  useEffect(() => {
    if (loading || loadFailed) return;
    window.dispatchEvent(new CustomEvent(STORE_HOURS_SECTIONS_LAYOUT_EVENT));
  }, [loading, loadFailed, hoursMode]);

  const applyHoursTemplate = useCallback(
    (template: {
      configured: boolean;
      hours_mode: StoreHoursMode;
      holiday_fallback_day_kind: StoreHolidayFallbackDayKind;
      weekday_rules: StoreWeekdayRule[];
      calendar_overrides?: StoreCalendarOverride[] | null;
    }) => {
      setConfigured(template.configured);
      setHoursMode(template.hours_mode);
      setHolidayFallback(template.holiday_fallback_day_kind);
      const local = apiRulesToLocal(template.weekday_rules);
      setByWeekday(local);
      const mon = local.find((r) => r.weekday === 1) ?? local[0];
      setCommon({
        weekday: 1,
        day_kind: mon.day_kind,
        segments:
          mon.day_kind === "segments" && mon.segments.length > 0
            ? mon.segments.map((s) => ({ ...s, _key: newKey() }))
            : [defaultSegment()],
      });
      setOverrides(localOverridesFromApi(template.calendar_overrides ?? []));
    },
    [],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setBanner(null);
    setLoadFailed(false);
    setResolveRows(null);
    try {
      if (staffId) {
        const res = await fetchStaffOperatingHours(botId, store.id, staffId);
        setStaffHoursScope(res.hours_scope);
        if (res.hours_scope === "custom" && res.configured) {
          applyHoursTemplate({
            configured: res.configured,
            hours_mode: res.hours_mode ?? "by_weekday",
            holiday_fallback_day_kind: res.holiday_fallback_day_kind ?? "closed",
            weekday_rules: res.weekday_rules,
            calendar_overrides: res.calendar_overrides ?? [],
          });
        } else {
          setConfigured(false);
          setHoursMode("by_weekday");
          setHolidayFallback("closed");
          setByWeekday(emptyWeekdayRules());
          setCommon({
            weekday: 1,
            day_kind: "closed",
            segments: [],
          });
          setOverrides([]);
        }
      } else {
        const res = await fetchStoreOperatingHours(botId, store.id);
        applyHoursTemplate(res);
      }
    } catch (err) {
      setLoadFailed(true);
      notifyApiFailure(err, oh.loadFailed, errorByKey);
      setByWeekday(emptyWeekdayRules());
      setOverrides([]);
    } finally {
      setLoading(false);
    }
  }, [applyHoursTemplate, botId, errorByKey, oh.loadFailed, staffId, store.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave() {
    if (loadFailed) return;
    setSaving(true);
    setBanner(null);
    try {
      if (staffId) {
        if (staffHoursScope === "inherit_store") {
          await putStaffOperatingHours(botId, store.id, staffId, { hours_scope: "inherit_store" });
        } else {
          const inner = buildPutPayload(hoursMode, holidayFallback, byWeekday, common, overrides);
          await putStaffOperatingHours(botId, store.id, staffId, {
            hours_scope: "custom",
            ...inner,
          });
        }
      } else {
        const payload = buildPutPayload(hoursMode, holidayFallback, byWeekday, common, overrides);
        await putStoreOperatingHours(botId, store.id, payload);
      }
      notifySuccess(oh.saved);
      await load();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setBanner(getErrorMessageByKey(err, oh.saveFailed, errorByKey));
      } else {
        setBanner(oh.saveFailed);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleResolvePreview() {
    setResolveLoading(true);
    setBanner(null);
    try {
      const res = staffId
        ? await resolveStaffOperatingHours(botId, store.id, staffId, resolveFrom, resolveTo)
        : await resolveStoreOperatingHours(botId, store.id, resolveFrom, resolveTo);
      setResolveRows(res.days);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setBanner(getErrorMessageByKey(err, oh.resolveFailed, errorByKey));
      } else {
        setBanner(oh.resolveFailed);
      }
      setResolveRows(null);
    } finally {
      setResolveLoading(false);
    }
  }

  function setCommonDayKind(kind: StoreDayKind) {
    setCommon((prev) => ({
      ...prev,
      day_kind: kind,
      segments:
        kind === "segments" && prev.segments.length === 0 ? [defaultSegment()] : prev.segments,
    }));
  }

  function updateByWeekday(wd: number, patch: Partial<LocalWeekdayRule>) {
    setByWeekday((prev) =>
      prev.map((r) => (r.weekday === wd ? { ...r, ...patch } : r)),
    );
  }

  function setByWeekdayKind(wd: number, kind: StoreDayKind) {
    setByWeekday((prev) =>
      prev.map((r) => {
        if (r.weekday !== wd) return r;
        return {
          ...r,
          day_kind: kind,
          segments:
            kind === "segments" && r.segments.length === 0 ? [defaultSegment()] : r.segments,
        };
      }),
    );
  }

  function copyMondayToAll() {
    const mon = byWeekday.find((r) => r.weekday === 1);
    if (!mon) return;
    setByWeekday((prev) =>
      prev.map((r) => ({
        ...r,
        day_kind: mon.day_kind,
        segments: mon.segments.map((s) => ({ ...stripLocalSegment(s), _key: newKey() })),
      })),
    );
  }

  function addOverride() {
    setOverrides((prev) => [
      ...prev,
      {
        _key: newKey(),
        calendar_date: todayYmd(),
        day_kind: "segments",
        segments: [defaultSegment()],
      },
    ]);
  }

  function removeOverride(key: string) {
    setOverrides((prev) => prev.filter((o) => o._key !== key));
  }

  function renderDayKindSelect(
    value: StoreDayKind,
    onChange: (v: StoreDayKind) => void,
    idSuffix: string,
  ) {
    const id = `${baseId}-${idSuffix}`;
    return (
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as StoreDayKind)}
        className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
      >
        <option value="closed">{oh.dayKindClosed}</option>
        <option value="open_24h">{oh.dayKind24h}</option>
        <option value="segments">{oh.dayKindSegments}</option>
      </select>
    );
  }

  function renderSegmentsEditor(
    segments: LocalSegment[],
    disabled: boolean,
    onChange: (next: LocalSegment[]) => void,
  ) {
    if (disabled) {
      return <p className="text-xs text-slate-400">{oh.segmentsDisabledHint}</p>;
    }
    return (
      <div className="flex flex-col gap-2">
        {segments.map((seg, idx) => (
          <div key={seg._key} className="flex flex-wrap items-center gap-2">
            <input
              type="time"
              value={clockInputValue(seg.start)}
              onChange={(e) => {
                const v = timeInputToHHmm(e.target.value);
                const next = [...segments];
                next[idx] = { ...seg, start: v };
                onChange(next);
              }}
              className="rounded border border-slate-300 px-2 py-1 font-mono text-sm"
            />
            <span className="text-slate-400">—</span>
            <input
              type="time"
              value={clockInputValueForEnd(seg.end)}
              onChange={(e) => {
                const v = timeInputEndToHHmm(e.target.value);
                const next = [...segments];
                next[idx] = { ...seg, end: v };
                onChange(next);
              }}
              className="rounded border border-slate-300 px-2 py-1 font-mono text-sm"
            />
            <label className="flex items-center gap-1 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={seg.is_overnight}
                onChange={(e) => {
                  const next = [...segments];
                  next[idx] = { ...seg, is_overnight: e.target.checked };
                  onChange(next);
                }}
              />
              {oh.overnight}
            </label>
            <button
              type="button"
              onClick={() => onChange(segments.filter((_, i) => i !== idx))}
              className="text-xs text-red-600 hover:underline"
            >
              {oh.removeSegment}
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...segments, defaultSegment()])}
          className="w-fit rounded border border-dashed border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
        >
          + {oh.addSegment}
        </button>
        <p className="text-xs text-slate-500">{oh.overnightHint}</p>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div
            id={HOURS_SECTION_IDS.intro}
            className="scroll-mt-24 mb-6 border-b border-slate-100 pb-4"
          >
            <h2 className="text-xl font-semibold text-slate-900">
              {staffId ? oh.staffHoursTitle : oh.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {store.name}
              <span className="ml-2 font-mono text-xs text-slate-500">({store.timezone})</span>
            </p>
            {!staffId && !configured ? (
              <p className="mt-2 text-xs text-amber-700">{oh.notConfiguredHint}</p>
            ) : null}
            {staffId ? (
              <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-medium text-slate-800">{oh.staffHoursScopeLabel}</p>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
                    <input
                      type="radio"
                      name="staff-hours-scope"
                      checked={staffHoursScope === "inherit_store"}
                      onChange={() => setStaffHoursScope("inherit_store")}
                      className="text-emerald-600"
                    />
                    {oh.staffInheritStore}
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
                    <input
                      type="radio"
                      name="staff-hours-scope"
                      checked={staffHoursScope === "custom"}
                      onChange={() => {
                        setStaffHoursScope("custom");
                        void (async () => {
                          try {
                            const s = await fetchStoreOperatingHours(botId, store.id);
                            applyHoursTemplate(s);
                          } catch (err) {
                            notifyApiFailure(err, oh.loadFailed, errorByKey);
                          }
                        })();
                      }}
                      className="text-emerald-600"
                    />
                    {oh.staffCustomSchedule}
                  </label>
                </div>
                {staffHoursScope === "inherit_store" ? (
                  <p className="text-xs leading-relaxed text-slate-600">{oh.staffInheritDescription}</p>
                ) : (
                  <p className="text-xs leading-relaxed text-slate-600">{oh.staffCustomDescription}</p>
                )}
              </div>
            ) : null}
          </div>

          {banner ? (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{banner}</div>
          ) : null}

          {loadFailed && !loading ? (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
              <span>{oh.loadFailed}</span>
              <button
                type="button"
                onClick={() => void load()}
                className="rounded-lg border border-amber-200 bg-white px-3 py-1 text-xs font-medium hover:bg-amber-100"
              >
                {oh.retryLoad}
              </button>
            </div>
          ) : null}

          {loading ? (
            <LoadingRegion aria-label={oh.loading} className="py-4">
              <StoreOperatingHoursBodySkeleton />
            </LoadingRegion>
          ) : (
        <div className="space-y-8">
          <div
            className={
              scheduleLocked
                ? "pointer-events-none space-y-8 select-none opacity-[0.48]"
                : "space-y-8"
            }
            aria-disabled={scheduleLocked}
          >
          <section
            id={HOURS_SECTION_IDS.mode}
            className="scroll-mt-24 rounded-xl border border-slate-200 bg-slate-50/60 p-4"
          >
            <h4 className="mb-3 text-sm font-semibold text-slate-800">{oh.sectionMode}</h4>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  {oh.hoursModeLabel}
                </label>
                <select
                  value={hoursMode}
                  onChange={(e) => setHoursMode(e.target.value as StoreHoursMode)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="weekly_common">{oh.modeWeeklyCommon}</option>
                  <option value="by_weekday">{oh.modeByWeekday}</option>
                </select>
                <p className="mt-1 text-xs text-slate-500">{oh.hoursModeHint}</p>
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  {oh.holidayFallbackLabel}
                </label>
                <select
                  value={holidayFallback}
                  onChange={(e) =>
                    setHolidayFallback(e.target.value as StoreHolidayFallbackDayKind)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="closed">{oh.fallbackClosed}</option>
                  <option value="inherit_weekday">{oh.fallbackInherit}</option>
                  <option value="open_24h">{oh.fallback24h}</option>
                </select>
                <p className="mt-1 text-xs text-slate-500">{oh.holidayFallbackHint}</p>
              </div>
            </div>
          </section>

          {hoursMode === "weekly_common" ? (
            <section
              id={HOURS_SECTION_IDS.schedule}
              className="scroll-mt-24 rounded-xl border border-slate-200 p-4"
            >
              <h4 className="mb-3 text-sm font-semibold text-slate-800">{oh.sectionWeeklyTemplate}</h4>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div>
                  <label className="mb-1 block text-xs text-slate-600">{oh.dayKindLabel}</label>
                  {renderDayKindSelect(common.day_kind, setCommonDayKind, "common-kind")}
                </div>
                <div className="min-w-0 flex-1">
                  <label className="mb-1 block text-xs text-slate-600">{oh.hoursLabel}</label>
                  {renderSegmentsEditor(
                    common.segments,
                    common.day_kind !== "segments",
                    (next) => setCommon((p) => ({ ...p, segments: next })),
                  )}
                </div>
              </div>
            </section>
          ) : (
            <section
              id={HOURS_SECTION_IDS.schedule}
              className="scroll-mt-24 rounded-xl border border-slate-200 p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-slate-800">{oh.sectionByWeekday}</h4>
                <button
                  type="button"
                  onClick={copyMondayToAll}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  {oh.copyMondayToAll}
                </button>
              </div>
              <div className="space-y-4">
                {byWeekday.map((row) => (
                  <div
                    key={row.weekday}
                    className="flex flex-col gap-2 border-b border-slate-100 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-start"
                  >
                    <div className="w-28 shrink-0 text-sm font-medium text-slate-800">
                      {oh.weekdayLabels[row.weekday - 1]}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                      <div>
                        {renderDayKindSelect(row.day_kind, (v) => setByWeekdayKind(row.weekday, v), `wd-${row.weekday}`)}
                      </div>
                      <div className="min-w-0 flex-1">
                        {renderSegmentsEditor(
                          row.segments,
                          row.day_kind !== "segments",
                          (next) => updateByWeekday(row.weekday, { segments: next }),
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section
            id={HOURS_SECTION_IDS.overrides}
            className="scroll-mt-24 rounded-xl border border-slate-200 p-4"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-slate-800">{oh.sectionOverrides}</h4>
              <button
                type="button"
                onClick={addOverride}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${platform.accentClassName} ${platform.hoverClassName}`}
              >
                {oh.addOverride}
              </button>
            </div>
            {overrides.length === 0 ? (
              <p className="text-sm text-slate-500">{oh.noOverrides}</p>
            ) : (
              <div className="space-y-4">
                {overrides.map((o) => (
                  <div
                    key={o._key}
                    className="rounded-lg border border-slate-100 bg-slate-50/50 p-3"
                  >
                    <div className="mb-2 flex flex-wrap items-end gap-3">
                      <div>
                        <label className="mb-1 block text-xs text-slate-600">{oh.overrideDate}</label>
                        <input
                          type="date"
                          value={o.calendar_date}
                          onChange={(e) =>
                            setOverrides((prev) =>
                              prev.map((x) =>
                                x._key === o._key ? { ...x, calendar_date: e.target.value } : x,
                              ),
                            )
                          }
                          className="rounded border border-slate-300 px-2 py-1 font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-600">{oh.dayKindLabel}</label>
                        {renderDayKindSelect(
                          o.day_kind,
                          (v) =>
                            setOverrides((prev) =>
                              prev.map((x) =>
                                x._key === o._key
                                  ? {
                                      ...x,
                                      day_kind: v,
                                      segments:
                                        v === "segments" && x.segments.length === 0
                                          ? [defaultSegment()]
                                          : x.segments,
                                    }
                                  : x,
                              ),
                            ),
                          `ov-kind-${o._key}`,
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOverride(o._key)}
                        className="ml-auto text-sm text-red-600 hover:underline"
                      >
                        {oh.removeOverride}
                      </button>
                    </div>
                    {renderSegmentsEditor(
                      o.segments,
                      o.day_kind !== "segments",
                      (next) =>
                        setOverrides((prev) =>
                          prev.map((x) => (x._key === o._key ? { ...x, segments: next } : x)),
                        ),
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
          </div>

          <section
            id={HOURS_SECTION_IDS.preview}
            className="scroll-mt-24 rounded-xl border border-slate-200 p-4"
          >
            <h4 className="mb-3 text-sm font-semibold text-slate-800">{oh.sectionPreview}</h4>
            <div className="mb-3 flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-1 block text-xs text-slate-600">{oh.resolveFrom}</label>
                <input
                  type="date"
                  value={resolveFrom}
                  onChange={(e) => setResolveFrom(e.target.value)}
                  className="rounded border border-slate-300 px-2 py-1 font-mono text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-600">{oh.resolveTo}</label>
                <input
                  type="date"
                  value={resolveTo}
                  onChange={(e) => setResolveTo(e.target.value)}
                  className="rounded border border-slate-300 px-2 py-1 font-mono text-sm"
                />
              </div>
              <button
                type="button"
                disabled={resolveLoading}
                onClick={() => void handleResolvePreview()}
                className={`rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 ${platform.accentClassName} ${platform.hoverClassName}`}
              >
                {resolveLoading ? "…" : oh.resolveButton}
              </button>
            </div>
            {resolveRows && resolveRows.length > 0 ? (
              <div className="max-h-56 overflow-auto rounded border border-slate-200">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="sticky top-0 bg-slate-100 text-slate-700">
                    <tr>
                      <th className="px-2 py-2">{oh.previewDate}</th>
                      <th className="px-2 py-2">{oh.previewSource}</th>
                      <th className="px-2 py-2">{oh.previewKind}</th>
                      <th className="px-2 py-2">{oh.previewHours}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resolveRows.map((d) => (
                      <tr key={d.calendar_date}>
                        <td className="px-2 py-1.5 font-mono">{d.calendar_date}</td>
                        <td className="px-2 py-1.5">{formatSource(d.resolution_source, oh)}</td>
                        <td className="px-2 py-1.5">{formatDayKind(d.day_kind, oh)}</td>
                        <td className="px-2 py-1.5 font-mono text-[11px]">
                          {formatResolvedSegments(d)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>

          <div
            id={HOURS_SECTION_IDS.actions}
            className="scroll-mt-24 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4"
          >
            <Link
              href={staffId ? staffListHref : backHref}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {staffId ? oh.backToStaffList : oh.backToDashboard}
            </Link>
            <button
              type="button"
              disabled={saving || loadFailed}
              onClick={() => void handleSave()}
              className={`rounded-lg px-6 py-2 text-sm font-medium disabled:opacity-50 ${platform.accentClassName} ${platform.hoverClassName}`}
            >
              {saving ? "…" : oh.save}
            </button>
          </div>
        </div>
      )}
        </div>
    </div>
  );
}

function formatSource(
  src: string,
  oh: { sourceOverride: string; sourceWeekday: string; sourceEffective?: string },
) {
  if (src === "calendar_override") return oh.sourceOverride;
  if (src === "weekday_template") return oh.sourceWeekday;
  if (src === "effective_intersection") return oh.sourceEffective ?? src;
  if (src.startsWith("staff_")) return src;
  return src;
}

function formatDayKind(
  k: string,
  oh: { dayKindClosed: string; dayKind24h: string; dayKindSegments: string },
) {
  if (k === "closed") return oh.dayKindClosed;
  if (k === "open_24h") return oh.dayKind24h;
  if (k === "segments") return oh.dayKindSegments;
  return k;
}

function formatResolvedSegments(d: { day_kind: string; segments?: StoreOperatingHoursSegment[] }) {
  if (d.day_kind === "closed") return "—";
  if (d.day_kind === "open_24h") return "24h";
  if (!d.segments?.length) return "—";
  return d.segments
    .map((s) => `${s.start}–${s.end}${s.is_overnight ? "*" : ""}`)
    .join(", ");
}

function clockInputValue(hhmm: string): string {
  if (hhmm === "24:00") return "23:59";
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return "00:00";
  return `${m[1]}:${m[2]}`;
}

function clockInputValueForEnd(hhmm: string): string {
  return clockInputValue(hhmm);
}

function timeInputToHHmm(v: string): string {
  if (!v) return "00:00";
  return v.length >= 5 ? v.slice(0, 5) : v;
}

function timeInputEndToHHmm(v: string): string {
  if (!v) return "00:00";
  const slice = v.length >= 5 ? v.slice(0, 5) : v;
  if (slice === "23:59") return "24:00";
  return slice;
}
