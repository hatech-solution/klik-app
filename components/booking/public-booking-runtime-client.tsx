"use client";

import { useEffect, useMemo, useState } from "react";

import {
  LoadingRegion,
  PublicBookingRuntimePageSkeleton,
  PublicBookingRuntimeSlotsSkeleton,
} from "@/components/ui/screen-loading-skeletons";
import type { PublicBookingCalendarViewMode } from "@/lib/api/store/types";
import {
  getPublicBookingRuntimeInit,
  getPublicBookingRuntimeSlots,
  postPublicBookingRuntime,
  type BookingRuntimeCourse,
  type BookingRuntimeInitResponse,
  type BookingRuntimeSlot,
  type BookingRuntimeStaff,
} from "@/lib/api/store/public-booking-runtime";
import { getMessages, type Locale } from "@/lib/i18n";
import { isPlatformId, PLATFORM_CONFIGS, type PlatformId } from "@/lib/platforms";

type BookingStep = 1 | 2 | 3 | 4 | 5;

type Draft = {
  step: BookingStep;
  selected_course_id: string | null;
  selected_staff_id: string | null;
  selected_start_at: string | null;
  selected_date: string | null;
  active_view_mode: PublicBookingCalendarViewMode;
  week_anchor: string;
  month_anchor: string;
  customer_name: string;
  customer_phone: string;
  customer_note: string;
  idempotency_key: string;
};

type Props = {
  locale: Locale;
  storeId: string;
};

type BookingPlatformTheme = {
  stepActiveClassName: string;
  stepTrailActiveClassName: string;
  selectionActiveClassName: string;
  monthDateSelectedClassName: string;
  slotSelectedClassName: string;
  slotAvailableClassName: string;
};

const BOOKING_PLATFORM_THEMES: Record<PlatformId, BookingPlatformTheme> = {
  line: {
    stepActiveClassName: "bg-emerald-600 text-white",
    stepTrailActiveClassName: "text-emerald-700 dark:text-emerald-200",
    selectionActiveClassName: "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
    monthDateSelectedClassName: "border-emerald-500 bg-emerald-100 text-emerald-700",
    slotSelectedClassName: "border-emerald-600 bg-emerald-600 text-white",
    slotAvailableClassName: "border-emerald-500 text-emerald-600",
  },
  zalo: {
    stepActiveClassName: "bg-sky-600 text-white",
    stepTrailActiveClassName: "text-sky-700 dark:text-sky-200",
    selectionActiveClassName: "border-sky-500 bg-sky-50 dark:bg-sky-900/20",
    monthDateSelectedClassName: "border-sky-500 bg-sky-100 text-sky-700",
    slotSelectedClassName: "border-sky-600 bg-sky-600 text-white",
    slotAvailableClassName: "border-sky-500 text-sky-600",
  },
  telegram: {
    stepActiveClassName: "bg-cyan-600 text-white",
    stepTrailActiveClassName: "text-cyan-700 dark:text-cyan-200",
    selectionActiveClassName: "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20",
    monthDateSelectedClassName: "border-cyan-500 bg-cyan-100 text-cyan-700",
    slotSelectedClassName: "border-cyan-600 bg-cyan-600 text-white",
    slotAvailableClassName: "border-cyan-500 text-cyan-600",
  },
  instagram: {
    stepActiveClassName: "bg-fuchsia-600 text-white",
    stepTrailActiveClassName: "text-fuchsia-700 dark:text-fuchsia-200",
    selectionActiveClassName: "border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20",
    monthDateSelectedClassName: "border-fuchsia-500 bg-fuchsia-100 text-fuchsia-700",
    slotSelectedClassName: "border-fuchsia-600 bg-fuchsia-600 text-white",
    slotAvailableClassName: "border-fuchsia-500 text-fuchsia-600",
  },
};

function formatDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateOnly(input: string): Date {
  const [y, m, d] = input.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfWeek(date: Date): Date {
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  const next = new Date(date);
  next.setDate(next.getDate() + offset);
  return next;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfMonthGrid(date: Date): Date {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  return startOfWeek(firstDay);
}

function displayTimeLabel(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function displayDateLabel(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `idem_${Date.now()}`;
}

export function PublicBookingRuntimeClient({ locale, storeId }: Props) {
  const t = getMessages(locale).store.bookingRuntimeMobile;
  const today = formatDateOnly(new Date());
  const storageKey = `booking_runtime_draft:${storeId}`;

  const [initLoading, setInitLoading] = useState(true);
  const [initData, setInitData] = useState<BookingRuntimeInitResponse | null>(null);
  const [step, setStep] = useState<BookingStep>(1);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedStartAt, setSelectedStartAt] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(today);
  const [activeViewMode, setActiveViewMode] = useState<PublicBookingCalendarViewMode>("week");
  const [weekAnchor, setWeekAnchor] = useState(today);
  const [monthAnchor, setMonthAnchor] = useState(today);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(createIdempotencyKey);
  const [banner, setBanner] = useState<string | null>(null);
  const [suggestedStartAts, setSuggestedStartAts] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slots, setSlots] = useState<BookingRuntimeSlot[]>([]);
  const [slotRefreshToken, setSlotRefreshToken] = useState(0);

  const requireCourse = initData?.settings.require_course_on_booking ?? true;
  const requireStaff = initData?.settings.require_staff_on_booking ?? true;
  const timezone = initData?.store.timezone ?? "Asia/Tokyo";
  const rawPlatformId = initData?.store.platform_id ?? "";
  const platformId: PlatformId = isPlatformId(rawPlatformId) ? rawPlatformId : "zalo";
  const platformConfig = PLATFORM_CONFIGS[platformId];
  const platformTheme = BOOKING_PLATFORM_THEMES[platformId];
  const stepTrailLabels = [t.stepCourseTrail, t.stepStaff, t.stepTimeSlotTrail, t.stepConfirm, t.stepSubmit];

  const weekRange = useMemo(() => {
    const start = startOfWeek(parseDateOnly(weekAnchor));
    const days = Array.from({ length: 7 }, (_, idx) => addDays(start, idx));
    return { from: formatDateOnly(days[0]), to: formatDateOnly(days[6]), days };
  }, [weekAnchor]);

  const monthDays = useMemo(() => {
    const start = startOfMonthGrid(parseDateOnly(monthAnchor));
    return Array.from({ length: 42 }, (_, idx) => addDays(start, idx));
  }, [monthAnchor]);

  const monthRange = useMemo(
    () => {
      const anchor = parseDateOnly(monthAnchor);
      const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
      const lastOfMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
      return {
        from: formatDateOnly(firstOfMonth),
        to: formatDateOnly(lastOfMonth),
      };
    },
    [monthAnchor],
  );
  const weekRangeLabel = useMemo(() => {
    if (weekRange.days.length === 0) return t.weekLabel;
    const first = weekRange.days[0];
    const last = weekRange.days[weekRange.days.length - 1];
    return `${displayDateLabel(first, locale)} ~ ${displayDateLabel(last, locale)}`;
  }, [locale, t.weekLabel, weekRange.days]);

  const courses = useMemo(
    () => (initData?.courses ?? []).filter((course) => course.is_active),
    [initData?.courses],
  );

  const staffs = useMemo(() => {
    const all = (initData?.staffs ?? []).filter((staff) => staff.is_active);
    if (!selectedCourseId) return all;
    return all.filter((staff) => staff.course_ids.includes(selectedCourseId));
  }, [initData?.staffs, selectedCourseId]);

  const effectiveSelectedCourseId = useMemo(
    () => (selectedCourseId && courses.some((course) => course.id === selectedCourseId) ? selectedCourseId : null),
    [courses, selectedCourseId],
  );

  const effectiveSelectedStaffId = useMemo(
    () =>
      selectedStaffId && staffs.some((staff) => staff.id === selectedStaffId)
        ? selectedStaffId
        : null,
    [selectedStaffId, staffs],
  );

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === effectiveSelectedCourseId) ?? null,
    [courses, effectiveSelectedCourseId],
  );

  const selectedStaff = useMemo(
    () => staffs.find((staff) => staff.id === effectiveSelectedStaffId) ?? null,
    [effectiveSelectedStaffId, staffs],
  );

  const canLoadSlots =
    (!requireCourse || Boolean(effectiveSelectedCourseId)) &&
    (!requireStaff || Boolean(effectiveSelectedStaffId));

  useEffect(() => {
    let mounted = true;
    async function loadInit() {
      setInitLoading(true);
      try {
        const response = await getPublicBookingRuntimeInit(storeId);
        if (!mounted) return;

        setInitData(response);
        try {
          const raw = window.localStorage.getItem(storageKey);
          if (raw) {
            const draft = JSON.parse(raw) as Draft;
            setStep(draft.step);
            setSelectedCourseId(draft.selected_course_id);
            setSelectedStaffId(draft.selected_staff_id);
            setSelectedStartAt(draft.selected_start_at);
            setSelectedDate(draft.selected_date);
            setActiveViewMode(
              response.settings.calendar_view_mode === "week" ? "week" : draft.active_view_mode,
            );
            setWeekAnchor(draft.week_anchor);
            setMonthAnchor(draft.month_anchor);
            setCustomerName(draft.customer_name);
            setCustomerPhone(draft.customer_phone);
            setCustomerNote(draft.customer_note);
            setIdempotencyKey(draft.idempotency_key || createIdempotencyKey());
          } else {
            setActiveViewMode(response.settings.calendar_view_mode);
          }
        } catch {
          setActiveViewMode(response.settings.calendar_view_mode);
        }
      } catch {
        if (mounted) {
          setBanner(t.submitInvalid);
        }
      } finally {
        if (mounted) {
          setInitLoading(false);
        }
      }
    }
    void loadInit();
    return () => {
      mounted = false;
    };
  }, [storageKey, storeId, t.submitInvalid]);

  useEffect(() => {
    if (initData?.settings.calendar_view_mode !== "week") return;
    if (activeViewMode !== "week") {
      setActiveViewMode("week");
    }
  }, [activeViewMode, initData?.settings.calendar_view_mode]);

  useEffect(() => {
    if (initLoading || !initData) return;
    const draft: Draft = {
      step,
      selected_course_id: selectedCourseId,
      selected_staff_id: selectedStaffId,
      selected_start_at: selectedStartAt,
      selected_date: selectedDate,
      active_view_mode: activeViewMode,
      week_anchor: weekAnchor,
      month_anchor: monthAnchor,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_note: customerNote,
      idempotency_key: idempotencyKey,
    };
    window.localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [
    activeViewMode,
    customerName,
    customerNote,
    customerPhone,
    idempotencyKey,
    initData,
    initLoading,
    monthAnchor,
    selectedCourseId,
    selectedDate,
    selectedStaffId,
    selectedStartAt,
    step,
    storageKey,
    weekAnchor,
  ]);

  useEffect(() => {
    if (!initData) return;
    if (!canLoadSlots) return;
    // Chỉ cần slot khi đang ở bước lịch (3). Tránh GET /booking/slots dư khi ở bước 4/5
    // (ví dụ draft/localStorage effect hoặc deps khác khiến effect chạy lại).
    if (step !== 3) return;

    let mounted = true;
    async function loadSlots() {
      setSlotsLoading(true);
      try {
        const range = activeViewMode === "week" ? weekRange : monthRange;
        const response = await getPublicBookingRuntimeSlots({
          store_id: storeId,
          from_date: range.from,
          to_date: range.to,
          course_id: effectiveSelectedCourseId,
          staff_id: effectiveSelectedStaffId,
        });
        if (!mounted) return;
        setSlots(response.slots);
      } catch {
        if (mounted) {
          setSlots([]);
          setBanner(t.submitInvalid);
        }
      } finally {
        if (mounted) {
          setSlotsLoading(false);
        }
      }
    }
    void loadSlots();
    return () => {
      mounted = false;
    };
  }, [
    activeViewMode,
    canLoadSlots,
    effectiveSelectedCourseId,
    effectiveSelectedStaffId,
    initData,
    monthRange,
    slotRefreshToken,
    step,
    storeId,
    t.submitInvalid,
    weekRange,
  ]);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, BookingRuntimeSlot[]>();
    for (const slot of slots) {
      const dateKey = slot.start_at.slice(0, 10);
      const current = map.get(dateKey) ?? [];
      current.push(slot);
      map.set(dateKey, current);
    }
    return map;
  }, [slots]);

  function availableSlotsOfDate(dateKey: string): BookingRuntimeSlot[] {
    if (!canLoadSlots) return [];
    return (slotsByDate.get(dateKey) ?? []).filter((slot) => slot.status === "available");
  }

  function canProceed(): boolean {
    if (step === 1) return !requireCourse || Boolean(effectiveSelectedCourseId);
    if (step === 2) return !requireStaff || Boolean(effectiveSelectedStaffId);
    if (step === 3) return Boolean(selectedStartAt);
    if (step === 4)
      return Boolean(customerName.trim()) && Boolean(customerPhone.trim()) && Boolean(selectedStartAt);
    return true;
  }

  function goNext() {
    if (!canProceed()) return;
    setBanner(null);
    setStep((prev) => (prev < 4 ? ((prev + 1) as BookingStep) : prev));
  }

  function goBack() {
    setBanner(null);
    setStep((prev) => (prev > 1 && prev < 5 ? ((prev - 1) as BookingStep) : prev));
  }

  function jumpToCurrentCalendar() {
    const current = formatDateOnly(new Date());
    setSelectedDate(current);
    setWeekAnchor(current);
    setMonthAnchor(current);
  }

  async function submitBooking() {
    if (!selectedStartAt) return;
    setBanner(null);
    const response = await postPublicBookingRuntime({
      store_id: storeId,
      idempotency_key: idempotencyKey,
      course_id: effectiveSelectedCourseId,
      staff_id: effectiveSelectedStaffId,
      start_at: selectedStartAt,
      timezone,
      customer: {
        name: customerName,
        phone_number: customerPhone,
        note: customerNote.trim() || null,
      },
    });

    if (response.ok) {
      setStep(5);
      setBanner(t.submitSuccess);
      return;
    }

    if (response.error.code === 41004) {
      setStep(3);
      setBanner(t.slotConflict);
      setSuggestedStartAts((response.error.suggested_slots ?? []).map((slot) => slot.start_at));
      setSelectedStartAt(null);
      setSlotRefreshToken((prev) => prev + 1);
      setIdempotencyKey(createIdempotencyKey());
      return;
    }

    setBanner(t.submitInvalid);
  }

  function resetFlow() {
    window.localStorage.removeItem(storageKey);
    setStep(1);
    setSelectedCourseId(null);
    setSelectedStaffId(null);
    setSelectedStartAt(null);
    setSelectedDate(today);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerNote("");
    setSuggestedStartAts([]);
    setBanner(null);
    setSlotRefreshToken((prev) => prev + 1);
    setIdempotencyKey(createIdempotencyKey());
    setActiveViewMode(initData?.settings.calendar_view_mode ?? "week");
  }

  if (initLoading) {
    return (
      <LoadingRegion aria-label={t.loading}>
        <PublicBookingRuntimePageSkeleton />
      </LoadingRegion>
    );
  }

  if (!initData) {
    return (
      <div className="dm-page-muted min-h-screen py-3">
        <div className="mx-auto max-w-[430px] px-3">
          <div className="dm-overview-panel rounded-2xl p-4 text-sm text-(--dm-text-muted)">
            {banner ?? t.submitInvalid}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dm-page-muted min-h-screen pb-24 pt-3">
      <main className="mx-auto max-w-[430px] space-y-3 px-3">
      {/* <section className="dm-overview-panel rounded-2xl p-4">
        <p className="text-base font-semibold text-(--dm-text)">{initData.store.name}</p>
        <p className="mt-1 text-xs text-(--dm-text-muted)">{t.subtitle}</p>
        <div className="mt-3 inline-flex items-center rounded-full bg-(--dm-surface-muted) px-3 py-1 text-[11px] text-(--dm-text-secondary)">
          {t.configModeLabel}
          <strong className="ml-1">
            {initData.settings.calendar_view_mode === "week" ? t.modeWeek : t.modeMonth}
          </strong>
        </div>
      </section> */}

      <section className="dm-overview-panel !rounded-md !px-3 !py-1.5">
        <div className="flex w-full flex-wrap items-center justify-center gap-x-1 gap-y-0.5 text-center text-[11px] font-semibold leading-tight">
          {stepTrailLabels.map((label, idx) => {
            const number = idx + 1;
            const active = step === number;
            const done = step > number;
            const textClass = active
              ? platformTheme.stepTrailActiveClassName
              : done
                ? "text-(--dm-text)"
                : "text-(--dm-text-secondary)";
            return (
              <span key={label} className={`inline-flex items-center ${textClass}`}>
                <span>{label}</span>
                {idx < stepTrailLabels.length - 1 ? <span className="px-1 text-(--dm-text-muted)">{">"}</span> : null}
              </span>
            );
          })}
        </div>
      </section>

      {step >= 3 ? (
        <section className="dm-overview-panel rounded-2xl p-3">
          <p className="mb-2 text-xs font-medium text-(--dm-text-muted)">{t.summaryTitle}</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border border-(--dm-border) bg-(--dm-surface-muted) p-2 text-left"
            >
              <p className="text-(--dm-text-muted)">{t.summaryService}</p>
              <p className="mt-1 line-clamp-1 font-medium text-(--dm-text)">
                {selectedCourse?.name ?? t.noCourse}
              </p>
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-lg border border-(--dm-border) bg-(--dm-surface-muted) p-2 text-left"
            >
              <p className="text-(--dm-text-muted)">{t.summaryStaff}</p>
              <p className="mt-1 line-clamp-1 font-medium text-(--dm-text)">
                {selectedStaff?.name ?? t.anyStaff}
              </p>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-lg border border-(--dm-border) bg-(--dm-surface-muted) p-2 text-left"
            >
              <p className="text-(--dm-text-muted)">{t.summarySlot}</p>
              <p className="mt-1 line-clamp-1 font-medium text-(--dm-text)">
                {selectedStartAt ? displayTimeLabel(selectedStartAt, locale) : "-"}
              </p>
            </button>
          </div>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="dm-overview-panel rounded-2xl p-4">
          <h2 className="text-sm font-semibold">{t.stepService}</h2>
          {!requireCourse ? (
            <button
              type="button"
              onClick={() => setSelectedCourseId(null)}
              className={`mt-2 w-full rounded-lg border px-3 py-2 text-left text-sm ${
                selectedCourseId === null
                  ? platformTheme.selectionActiveClassName
                  : "border-(--dm-border) bg-(--dm-surface)"
              }`}
            >
              {t.noCourse}
            </button>
          ) : null}
          <div className="mt-2 space-y-2">
            {courses.map((course: BookingRuntimeCourse) => (
              <button
                key={course.id}
                type="button"
                onClick={() => {
                  setSelectedCourseId(course.id);
                  setSelectedStaffId(null);
                  setSelectedStartAt(null);
                  setSuggestedStartAts([]);
                  setBanner(null);
                  setIdempotencyKey(createIdempotencyKey());
                }}
                className={`w-full rounded-lg border px-3 py-2 text-left ${
                  selectedCourseId === course.id
                    ? platformTheme.selectionActiveClassName
                    : "border-(--dm-border) bg-(--dm-surface)"
                }`}
              >
                <div className="flex items-center gap-3">
                  {course.primary_image ? (
                    <img
                      src={course.primary_image}
                      alt={course.name}
                      className="h-14 w-14 rounded-md object-cover"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{course.name}</p>
                    <p className="text-xs text-(--dm-text-muted)">
                      {course.duration_minutes}m {course.price != null ? `· ¥${course.price.toLocaleString()}` : ""}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="dm-overview-panel rounded-2xl p-4">
          <h2 className="text-sm font-semibold">{t.stepStaff}</h2>
          {!requireStaff ? (
            <button
              type="button"
              onClick={() => setSelectedStaffId(null)}
              className={`mt-2 w-full rounded-lg border px-3 py-2 text-left text-sm ${
                selectedStaffId === null
                  ? platformTheme.selectionActiveClassName
                  : "border-(--dm-border) bg-(--dm-surface)"
              }`}
            >
              {t.anyStaff}
            </button>
          ) : null}
          <div className="mt-2 space-y-2">
            {staffs.map((staff: BookingRuntimeStaff) => (
              <button
                key={staff.id}
                type="button"
                onClick={() => {
                  setSelectedStaffId(staff.id);
                  setSelectedStartAt(null);
                  setSuggestedStartAts([]);
                  setBanner(null);
                  setIdempotencyKey(createIdempotencyKey());
                }}
                className={`w-full rounded-lg border px-3 py-2 text-left ${
                  selectedStaffId === staff.id
                    ? platformTheme.selectionActiveClassName
                    : "border-(--dm-border) bg-(--dm-surface)"
                }`}
              >
                <div className="flex items-center gap-3">
                  {staff.primary_image ? (
                    <img
                      src={staff.primary_image}
                      alt={staff.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : null}
                  <p className="text-sm font-medium">{staff.name}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="dm-overview-panel rounded-2xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={jumpToCurrentCalendar}
              className="rounded-md border border-(--dm-border) bg-(--dm-surface-muted) px-2 py-1 text-xs text-(--dm-text-secondary)"
            >
              {activeViewMode === "month" ? t.goCurrentMonth : t.goCurrentWeek}
            </button>
            {initData.settings.calendar_view_mode === "month" ? (
              <button
                type="button"
                onClick={() => setActiveViewMode((prev) => (prev === "month" ? "week" : "month"))}
                className="rounded-md border border-(--dm-border) bg-(--dm-surface-muted) px-2 py-1 text-xs text-(--dm-text-secondary)"
              >
                {activeViewMode === "month" ? t.openWeek : t.backMonth}
              </button>
            ) : null}
          </div>

          {slotsLoading ? (
            <LoadingRegion aria-label={t.loadingSlots}>
              <PublicBookingRuntimeSlotsSkeleton viewMode={activeViewMode} />
            </LoadingRegion>
          ) : activeViewMode === "month" ? (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  className={`inline-flex min-w-12 items-center justify-center rounded-md px-4 py-1.5 text-sm font-semibold text-white ${platformConfig.accentClassName} ${platformConfig.hoverClassName}`}
                  onClick={() => {
                    const d = parseDateOnly(monthAnchor);
                    d.setMonth(d.getMonth() - 1);
                    setMonthAnchor(formatDateOnly(d));
                  }}
                >
                  {"<"}
                </button>
                <p className="text-sm font-medium">
                  {new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" }).format(
                    parseDateOnly(monthAnchor),
                  )}
                </p>
                <button
                  type="button"
                  className={`inline-flex min-w-12 items-center justify-center rounded-md px-4 py-1.5 text-sm font-semibold text-white ${platformConfig.accentClassName} ${platformConfig.hoverClassName}`}
                  onClick={() => {
                    const d = parseDateOnly(monthAnchor);
                    d.setMonth(d.getMonth() + 1);
                    setMonthAnchor(formatDateOnly(d));
                  }}
                >
                  {">"}
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-[11px] text-(--dm-text-muted)">
                {t.weekdayShort.map((name) => (
                  <div key={name} className="text-center">
                    {name}
                  </div>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {monthDays.map((day) => {
                  const key = formatDateOnly(day);
                  const available = availableSlotsOfDate(key).length > 0;
                  const selected = selectedDate === key;
                  const inMonth = day.getMonth() === parseDateOnly(monthAnchor).getMonth();
                  const clickable = inMonth && available;
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={!clickable}
                      onClick={() => {
                        if (!clickable) return;
                        setSelectedDate(key);
                        setWeekAnchor(key);
                        setActiveViewMode("week");
                      }}
                      className={`min-h-12 rounded-lg border px-1 py-1 text-xs ${
                        selected
                          ? platformTheme.monthDateSelectedClassName
                          : "border-(--dm-border) bg-(--dm-surface-muted)"
                      } ${inMonth ? "" : "opacity-40"} ${clickable ? "" : "cursor-not-allowed"}`}
                    >
                      <div>{day.getDate()}</div>
                      <div className="mt-1">{inMonth ? (available ? "○" : "⊘") : ""}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  className={`inline-flex min-w-12 items-center justify-center rounded-md px-4 py-1.5 text-sm font-semibold text-white ${platformConfig.accentClassName} ${platformConfig.hoverClassName}`}
                  onClick={() => {
                    const prev = addDays(parseDateOnly(weekAnchor), -7);
                    const key = formatDateOnly(prev);
                    setWeekAnchor(key);
                    setSelectedDate(key);
                  }}
                >
                  {"<"}
                </button>
                <p className="text-sm font-medium">{weekRangeLabel}</p>
                <button
                  type="button"
                  className={`inline-flex min-w-12 items-center justify-center rounded-md px-4 py-1.5 text-sm font-semibold text-white ${platformConfig.accentClassName} ${platformConfig.hoverClassName}`}
                  onClick={() => {
                    const next = addDays(parseDateOnly(weekAnchor), 7);
                    const key = formatDateOnly(next);
                    setWeekAnchor(key);
                    setSelectedDate(key);
                  }}
                >
                  {">"}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-1 text-center text-[11px]">
                  <thead>
                    <tr>
                      <th />
                      {weekRange.days.map((day) => (
                        <th key={formatDateOnly(day)} className="rounded-md bg-(--dm-surface-muted) p-1">
                          <div>{t.weekdayShort[(day.getDay() + 6) % 7]}</div>
                          <div className="text-[10px] text-(--dm-text-muted)">{day.getDate()}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(
                      new Set(
                        slots
                          .map((slot) => slot.start_at.slice(11, 16))
                          .sort((a, b) => a.localeCompare(b)),
                      ),
                    ).map((time) => (
                      <tr key={time}>
                        <td className="text-[10px] text-(--dm-text-muted)">{time}</td>
                        {weekRange.days.map((day) => {
                          const dateKey = formatDateOnly(day);
                          const option = (slotsByDate.get(dateKey) ?? []).find(
                            (slot) => slot.start_at.slice(11, 16) === time,
                          );
                          const available = option?.status === "available";
                          const selected = option && selectedStartAt === option.start_at;
                          const suggested = option ? suggestedStartAts.includes(option.start_at) : false;
                          return (
                            <td key={`${dateKey}-${time}`}>
                              <button
                                type="button"
                                disabled={!available}
                                onClick={() => {
                                  if (!option) return;
                                  setSelectedStartAt(option.start_at);
                                  setSelectedDate(option.start_at.slice(0, 10));
                                  setSuggestedStartAts([]);
                                  setBanner(null);
                                }}
                                className={`h-7 w-7 rounded-full border ${
                                  selected
                                    ? platformTheme.slotSelectedClassName
                                    : suggested
                                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                      : available
                                        ? platformTheme.slotAvailableClassName
                                        : "border-(--dm-border) text-(--dm-text-muted)"
                                }`}
                              >
                                {available ? "○" : "⊘"}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      ) : null}

      {step === 4 ? (
        <section className="dm-overview-panel rounded-2xl p-4">
          <h2 className="text-sm font-semibold">{t.stepConfirm}</h2>
          <div className="mt-2 space-y-2 text-sm">
            <p>
              <span className="text-(--dm-text-muted)">{t.summaryService}: </span>
              {selectedCourse?.name ?? t.noCourse}
            </p>
            <p>
              <span className="text-(--dm-text-muted)">{t.summaryStaff}: </span>
              {selectedStaff?.name ?? t.anyStaff}
            </p>
            <p>
              <span className="text-(--dm-text-muted)">{t.summarySlot}: </span>
              {selectedStartAt ? displayTimeLabel(selectedStartAt, locale) : "-"}
            </p>
          </div>
          <div className="mt-3 space-y-2">
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="dm-input"
              placeholder={t.customerName}
            />
            <input
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              className="dm-input"
              placeholder={t.customerPhone}
            />
            <textarea
              value={customerNote}
              onChange={(event) => setCustomerNote(event.target.value)}
              className="dm-input"
              rows={3}
              placeholder={t.customerNote}
            />
          </div>
        </section>
      ) : null}

      {step === 5 ? (
        <section className="dm-overview-panel rounded-2xl p-4 text-center">
          <p className="dm-alert-success text-sm font-semibold">{t.submitSuccess}</p>
        </section>
      ) : null}

      {banner ? (
        <section className="dm-banner-warn rounded-xl px-3 py-2 text-xs">
          {banner}
        </section>
      ) : null}

      </main>
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[430px] border-t border-(--dm-border) bg-(--dm-surface) px-3 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {step < 5 ? (
          <div className="flex items-center gap-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="rounded-xl border border-(--dm-border) bg-(--dm-surface-muted) px-4 py-3 text-sm font-semibold text-(--dm-text)"
              >
                {t.backCta}
              </button>
            ) : null}
            {step < 4 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!canProceed()}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-40 ${platformConfig.accentClassName} ${platformConfig.hoverClassName}`}
              >
                {t.continueCta}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void submitBooking()}
                disabled={!canProceed()}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-40 ${platformConfig.accentClassName} ${platformConfig.hoverClassName}`}
              >
                {t.submitCta}
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={resetFlow}
            className="w-full rounded-xl bg-slate-700 px-4 py-3 text-sm font-semibold text-white"
          >
            {t.restartCta}
          </button>
        )}
      </div>
    </div>
  );
}
