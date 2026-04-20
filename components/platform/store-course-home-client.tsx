"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ConfirmModal } from "@/components/common/confirm-modal";
import { useStoreSettingsGate } from "@/components/platform/store-settings-context";
import { LoadingRegion, StoreTableSkeleton } from "@/components/ui/screen-loading-skeletons";
import {
  deleteCourse,
  fetchCourseList,
  fetchCourseSettings,
  fetchStaffCourseLinks,
  fetchStaffList,
  putCourseSettings,
  putStaffCourseLinks,
} from "@/lib/api/store/client";
import type {
  CourseApiItem,
  CourseSettingsApiItem,
  StaffApiItem,
  StaffCourseLinksApiItem,
} from "@/lib/api/store/types";
import { ApiClientError, getErrorMessageByKey } from "@/lib/api/error";
import { getMessages, type Locale } from "@/lib/i18n";
import { notifyError, notifySuccess } from "@/lib/toast";

type Props = {
  locale: Locale;
};

type CourseSortOption =
  | "sort_order_asc"
  | "sort_order_desc"
  | "name_asc"
  | "name_desc"
  | "duration_asc"
  | "duration_desc";

function isCourseSortOption(value: string | null): value is CourseSortOption {
  return (
    value === "sort_order_asc" ||
    value === "sort_order_desc" ||
    value === "name_asc" ||
    value === "name_desc" ||
    value === "duration_asc" ||
    value === "duration_desc"
  );
}

function splitDurationMinutes(total: number | null): { hours: string; minutes: string } {
  if (total == null || !Number.isFinite(total) || total < 0) {
    return { hours: "", minutes: "" };
  }
  const value = Math.floor(total);
  return { hours: String(Math.floor(value / 60)), minutes: String(value % 60) };
}

function parseDurationMinutes(hoursText: string, minutesText: string): number | null | undefined {
  const hRaw = hoursText.trim();
  const mRaw = minutesText.trim();
  if (hRaw === "" && mRaw === "") {
    return null;
  }

  const h = Number.parseInt(hRaw || "0", 10);
  const m = Number.parseInt(mRaw || "0", 10);
  if (!Number.isFinite(h) || h < 0) return undefined;
  if (!Number.isFinite(m) || m < 0 || m > 55 || m % 5 !== 0) return undefined;
  return h * 60 + m;
}

const EMPTY_LINKS: StaffCourseLinksApiItem = {
  staff_id: "",
  staff_covers_all_courses: false,
  course_ids: [],
};

export function StoreCourseHomeClient({ locale }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryFromUrl = searchParams.get("q") ?? "";
  const sortFromUrl = isCourseSortOption(searchParams.get("sort"))
    ? (searchParams.get("sort") as CourseSortOption)
    : "sort_order_asc";

  const gate = useStoreSettingsGate();
  const t = getMessages(locale);
  const c = t.store.course;
  const st = t.store.staff;
  const errorByKey = t.store.errorByKey as Record<string, string>;

  const [courses, setCourses] = useState<CourseApiItem[]>([]);
  const [staff, setStaff] = useState<StaffApiItem[]>([]);
  const [settings, setSettings] = useState<CourseSettingsApiItem | null>(null);
  const [linksByStaff, setLinksByStaff] = useState<Record<string, StaffCourseLinksApiItem>>({});

  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);

  const [settingsBusy, setSettingsBusy] = useState(false);
  const [linksBusyByStaff, setLinksBusyByStaff] = useState<Record<string, boolean>>({});

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  const [requireCourse, setRequireCourse] = useState(false);
  const [hidePrice, setHidePrice] = useState(false);
  const [showDuration, setShowDuration] = useState(true);
  const [defaultDurationHours, setDefaultDurationHours] = useState("");
  const [defaultDurationMinutes, setDefaultDurationMinutes] = useState("");
  const [courseQuery, setCourseQuery] = useState(queryFromUrl);
  const [courseSort, setCourseSort] = useState<CourseSortOption>(sortFromUrl);

  const [bulkStaffIds, setBulkStaffIds] = useState<string[]>([]);
  const [bulkCourseIds, setBulkCourseIds] = useState<string[]>([]);
  const [bulkCoversAllCourses, setBulkCoversAllCourses] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = useCallback(async () => {
    if (!gate) return;
    setLoading(true);
    setBanner(null);
    try {
      const [courseRows, cfg, staffRows] = await Promise.all([
        fetchCourseList(gate.botId, gate.storeId),
        fetchCourseSettings(gate.botId, gate.storeId),
        fetchStaffList(gate.botId, gate.storeId),
      ]);
      setCourses(courseRows);
      setSettings(cfg);
      setStaff(staffRows);
      setRequireCourse(cfg.require_course_on_booking);
      setHidePrice(cfg.hide_course_price_on_public);
      setShowDuration(cfg.show_course_duration_on_public);
      const split = splitDurationMinutes(cfg.default_duration_when_no_course);
      setDefaultDurationHours(split.hours);
      setDefaultDurationMinutes(split.minutes);

      const linksEntries = await Promise.all(
        staffRows.map(async (row) => {
          try {
            const links = await fetchStaffCourseLinks(gate.botId, gate.storeId, row.id);
            return [row.id, links] as const;
          } catch {
            return [
              row.id,
              {
                ...EMPTY_LINKS,
                staff_id: row.id,
              },
            ] as const;
          }
        }),
      );
      setLinksByStaff(Object.fromEntries(linksEntries));
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? getErrorMessageByKey(err, c.loadFailed, errorByKey)
          : c.loadFailed;
      setBanner(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  }, [gate, c.loadFailed, errorByKey]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setCourseQuery((prev) => (prev === queryFromUrl ? prev : queryFromUrl));
    setCourseSort((prev) => (prev === sortFromUrl ? prev : sortFromUrl));
  }, [queryFromUrl, sortFromUrl]);

  useEffect(() => {
    const current = searchParams.toString();
    const nextParams = new URLSearchParams(current);
    if (courseQuery) {
      nextParams.set("q", courseQuery);
    } else {
      nextParams.delete("q");
    }
    if (courseSort !== "sort_order_asc") {
      nextParams.set("sort", courseSort);
    } else {
      nextParams.delete("sort");
    }

    const next = nextParams.toString();
    if (next === current) return;
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [courseQuery, courseSort, pathname, router, searchParams]);

  const sortedCourses = useMemo(() => {
    const rows = [...courses];
    rows.sort((a, b) => {
      switch (courseSort) {
        case "sort_order_desc":
          return b.sort_order === a.sort_order
            ? a.name.localeCompare(b.name)
            : b.sort_order - a.sort_order;
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "duration_asc":
          return a.duration_estimate_minutes - b.duration_estimate_minutes;
        case "duration_desc":
          return b.duration_estimate_minutes - a.duration_estimate_minutes;
        case "sort_order_asc":
        default:
          return a.sort_order === b.sort_order
            ? a.name.localeCompare(b.name)
            : a.sort_order - b.sort_order;
      }
    });
    return rows;
  }, [courses, courseSort]);

  const filteredCourses = useMemo(() => {
    const q = courseQuery.trim().toLowerCase();
    if (!q) {
      return sortedCourses;
    }
    return sortedCourses.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q) ||
        row.duration_estimate_minutes.toString().includes(q),
    );
  }, [sortedCourses, courseQuery]);

  function setStaffLinkState(staffId: string, patch: Partial<StaffCourseLinksApiItem>) {
    setLinksByStaff((prev) => ({
      ...prev,
      [staffId]: {
        ...(prev[staffId] ?? { ...EMPTY_LINKS, staff_id: staffId }),
        ...patch,
      },
    }));
  }

  async function saveSettings() {
    if (!gate || !settings) return;

    const parsedDuration = parseDurationMinutes(defaultDurationHours, defaultDurationMinutes);
    if (parsedDuration === undefined) {
      setBanner(c.settingsDefaultDurationHint);
      return;
    }

    setSettingsBusy(true);
    setBanner(null);
    try {
      const next = await putCourseSettings(gate.botId, gate.storeId, {
        require_course_on_booking: requireCourse,
        hide_course_price_on_public: hidePrice,
        show_course_duration_on_public: showDuration,
        default_duration_when_no_course: parsedDuration,
      });
      setSettings(next);
      notifySuccess(t.toast.courseSettingsSaved);
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? getErrorMessageByKey(err, c.settingsLoadFailed, errorByKey)
          : c.settingsLoadFailed;
      setBanner(message);
    } finally {
      setSettingsBusy(false);
    }
  }

  async function saveStaffLinks(staffId: string) {
    if (!gate) return;
    const current = linksByStaff[staffId] ?? { ...EMPTY_LINKS, staff_id: staffId };
    setLinksBusyByStaff((prev) => ({ ...prev, [staffId]: true }));
    setBanner(null);
    try {
      const next = await putStaffCourseLinks(gate.botId, gate.storeId, staffId, {
        staff_covers_all_courses: current.staff_covers_all_courses,
        course_ids: current.course_ids,
      });
      setLinksByStaff((prev) => ({ ...prev, [staffId]: next }));
      notifySuccess(t.toast.staffCourseLinksSaved);
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? getErrorMessageByKey(err, c.staffLinksSaveFailed, errorByKey)
          : c.staffLinksSaveFailed;
      setBanner(message);
    } finally {
      setLinksBusyByStaff((prev) => ({ ...prev, [staffId]: false }));
    }
  }

  async function confirmDelete() {
    if (!gate || !deleteId) return;
    setDeleteBusy(true);
    setDeleteErr(null);
    try {
      await deleteCourse(gate.botId, gate.storeId, deleteId);
      setCourses((prev) => prev.filter((row) => row.id !== deleteId));
      setLinksByStaff((prev) => {
        const next: Record<string, StaffCourseLinksApiItem> = {};
        for (const [staffId, links] of Object.entries(prev)) {
          next[staffId] = {
            ...links,
            course_ids: links.course_ids.filter((id) => id !== deleteId),
          };
        }
        return next;
      });
      setDeleteId(null);
      notifySuccess(t.toast.courseDeleted);
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? getErrorMessageByKey(err, c.deleteFailed, errorByKey)
          : c.deleteFailed;
      setDeleteErr(message);
    } finally {
      setDeleteBusy(false);
    }
  }

  async function applyBulkStaffLinks() {
    if (!gate) return;
    if (bulkStaffIds.length === 0) {
      setBanner(c.bulkNoStaffSelected);
      return;
    }
    setBulkBusy(true);
    setBanner(null);
    try {
      const resultEntries = await Promise.all(
        bulkStaffIds.map(async (staffId) => {
          const res = await putStaffCourseLinks(gate.botId, gate.storeId, staffId, {
            staff_covers_all_courses: bulkCoversAllCourses,
            course_ids: bulkCoversAllCourses ? [] : bulkCourseIds,
          });
          return [staffId, res] as const;
        }),
      );
      setLinksByStaff((prev) => ({
        ...prev,
        ...Object.fromEntries(resultEntries),
      }));
      notifySuccess(t.toast.staffCourseLinksSaved);
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? getErrorMessageByKey(err, c.bulkApplyFailed, errorByKey)
          : c.bulkApplyFailed;
      setBanner(message);
    } finally {
      setBulkBusy(false);
    }
  }

  if (!gate) return null;

  const base = `/${locale}/stores/${gate.storeId}/settings/services`;

  return (
    <div className="space-y-8">
      <ConfirmModal
        open={deleteId !== null}
        title={c.deleteModalTitle}
        description={c.deleteConfirm}
        cancelLabel={t.common.confirmModal.cancel}
        confirmLabel={t.common.confirmModal.deleteAction}
        busyConfirmLabel={t.common.confirmModal.processing}
        confirmVariant="danger"
        busy={deleteBusy}
        errorMessage={deleteErr}
        onCancel={() => !deleteBusy && (setDeleteId(null), setDeleteErr(null))}
        onConfirm={() => void confirmDelete()}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--dm-text)]">{c.pageTitle}</h2>
          <p className="mt-1 text-sm text-[var(--dm-text-muted)]">{c.pageSubtitle}</p>
        </div>
        <Link
          href={`${base}/new`}
          className={`inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-white ${gate.platform.accentClassName} ${gate.platform.hoverClassName}`}
        >
          + {c.addCourse}
        </Link>
      </div>

      {banner ? <div className="dm-form-error-banner">{banner}</div> : null}

      <section className="dm-overview-panel">
        <h3 className="text-sm font-semibold text-[var(--dm-text)]">{c.settingsTitle}</h3>
        <div className="mt-4 space-y-4">
          <label className="flex items-center gap-2 text-sm text-[var(--dm-text-secondary)]">
            <input
              type="checkbox"
              checked={requireCourse}
              onChange={(e) => setRequireCourse(e.target.checked)}
              className="rounded border-[var(--dm-border)]"
            />
            {c.settingsRequireCourse}
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--dm-text-secondary)]">
            <input
              type="checkbox"
              checked={hidePrice}
              onChange={(e) => setHidePrice(e.target.checked)}
              className="rounded border-[var(--dm-border)]"
            />
            {c.settingsHidePrice}
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--dm-text-secondary)]">
            <input
              type="checkbox"
              checked={showDuration}
              onChange={(e) => setShowDuration(e.target.checked)}
              className="rounded border-[var(--dm-border)]"
            />
            {c.settingsShowDuration}
          </label>
          <div>
            <label className="dm-label mb-1 block text-xs">{c.settingsDefaultDuration}</label>
            <div className="grid max-w-lg gap-3 sm:grid-cols-2">
              <input
                type="number"
                min={0}
                step={1}
                value={defaultDurationHours}
                onChange={(e) => setDefaultDurationHours(e.target.value)}
                className="dm-input"
                placeholder={c.formDurationHours}
              />
              <input
                type="number"
                min={0}
                max={55}
                step={5}
                value={defaultDurationMinutes}
                onChange={(e) => setDefaultDurationMinutes(e.target.value)}
                className="dm-input"
                placeholder={c.formDurationMinutes}
              />
            </div>
            <p className="mt-1 text-xs text-[var(--dm-text-muted)]">{c.settingsDefaultDurationHint}</p>
          </div>
          <button
            type="button"
            disabled={settingsBusy || !settings}
            onClick={() => void saveSettings()}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${gate.platform.accentClassName} ${gate.platform.hoverClassName}`}
          >
            {settingsBusy ? "…" : c.settingsSave}
          </button>
        </div>
      </section>

      <div className="dm-table-wrap overflow-hidden rounded-xl">
        {loading ? (
          <LoadingRegion aria-label={c.loading} className="p-4 sm:p-6">
            <StoreTableSkeleton />
          </LoadingRegion>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col gap-3 px-4 pt-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="w-full max-w-md">
                <label className="dm-label mb-1 block text-xs">{c.tableName}</label>
                <input
                  value={courseQuery}
                  onChange={(e) => setCourseQuery(e.target.value)}
                  placeholder={c.searchPlaceholder}
                  className="dm-input"
                />
              </div>
              <div className="w-full max-w-xs">
                <label className="dm-label mb-1 block text-xs">{c.sortLabel}</label>
                <select
                  value={courseSort}
                  onChange={(e) => setCourseSort(e.target.value as CourseSortOption)}
                  className="dm-input"
                >
                  <option value="sort_order_asc">{c.sortSortOrderAsc}</option>
                  <option value="sort_order_desc">{c.sortSortOrderDesc}</option>
                  <option value="name_asc">{c.sortNameAsc}</option>
                  <option value="name_desc">{c.sortNameDesc}</option>
                  <option value="duration_asc">{c.sortDurationAsc}</option>
                  <option value="duration_desc">{c.sortDurationDesc}</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm text-[var(--dm-text-secondary)]">
              <thead className="dm-thead">
                <tr>
                  <th className="px-4 py-3 font-medium">{c.tableName}</th>
                  <th className="px-4 py-3 font-medium">{c.tableDuration}</th>
                  <th className="px-4 py-3 font-medium">{c.tablePrice}</th>
                  <th className="px-4 py-3 font-medium">{c.tableSort}</th>
                  <th className="px-4 py-3 text-right font-medium">{c.tableActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dm-border)]">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[var(--dm-text-muted)]">
                      {courseQuery.trim() ? c.noSearchResults : c.empty}
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((row) => (
                    <tr key={row.id} className="dm-tbody-row">
                      <td className="px-4 py-3 font-medium text-[var(--dm-text)]">{row.name}</td>
                      <td className="px-4 py-3 font-mono text-xs">{row.duration_estimate_minutes}m</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {row.price != null ? String(row.price) : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{row.sort_order}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`${base}/${row.id}/edit`}
                          className="mr-3 inline-flex text-[var(--dm-text-muted)] hover:text-[var(--dm-text)]"
                          title={c.editCourse}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteErr(null);
                            setDeleteId(row.id);
                          }}
                          className="inline-flex text-[var(--dm-text-muted)] hover:text-red-600"
                          title={c.deleteCourse}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      <section className="dm-overview-panel">
        <h3 className="text-sm font-semibold text-[var(--dm-text)]">{c.staffLinksTitle}</h3>
        <p className="mt-1 text-xs text-[var(--dm-text-muted)]">{c.staffLinksHint}</p>
        {staff.length > 0 ? (
          <div className="mt-4 rounded-lg border border-[var(--dm-border)] p-4">
            <h4 className="text-sm font-semibold text-[var(--dm-text)]">{c.bulkTitle}</h4>
            <p className="mt-1 text-xs text-[var(--dm-text-muted)]">{c.bulkHint}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setBulkStaffIds(staff.map((s) => s.id))}
                className="dm-btn-ghost rounded-lg px-3 py-1.5 text-xs"
              >
                {c.bulkSelectAllStaff}
              </button>
              <button
                type="button"
                onClick={() => setBulkStaffIds([])}
                className="dm-btn-ghost rounded-lg px-3 py-1.5 text-xs"
              >
                {c.bulkClearStaffSelection}
              </button>
            </div>
            <div className="mt-3">
              <p className="mb-2 text-xs font-medium text-[var(--dm-text-secondary)]">{c.bulkTargetStaff}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {staff.map((person) => {
                  const checked = bulkStaffIds.includes(person.id);
                  return (
                    <label key={`bulk-staff-${person.id}`} className="flex items-center gap-2 text-xs text-[var(--dm-text-secondary)]">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBulkStaffIds((prev) => Array.from(new Set([...prev, person.id])));
                          } else {
                            setBulkStaffIds((prev) => prev.filter((id) => id !== person.id));
                          }
                        }}
                        className="rounded border-[var(--dm-border)]"
                      />
                      {person.name}
                    </label>
                  );
                })}
              </div>
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm text-[var(--dm-text-secondary)]">
              <input
                type="checkbox"
                checked={bulkCoversAllCourses}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setBulkCoversAllCourses(checked);
                  if (checked) {
                    setBulkCourseIds([]);
                  }
                }}
                className="rounded border-[var(--dm-border)]"
              />
              {c.staffCoversAllCourses}
            </label>
            <div className="mt-3">
              <p className="mb-2 text-xs font-medium text-[var(--dm-text-secondary)]">{c.bulkTargetCourses}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {sortedCourses.length === 0 ? (
                  <p className="text-xs text-[var(--dm-text-muted)]">{c.empty}</p>
                ) : (
                  sortedCourses.map((row) => {
                    const checked = bulkCourseIds.includes(row.id);
                    return (
                      <label key={`bulk-course-${row.id}`} className="flex items-center gap-2 text-xs text-[var(--dm-text-secondary)]">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={bulkCoversAllCourses}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBulkCourseIds((prev) => Array.from(new Set([...prev, row.id])));
                            } else {
                              setBulkCourseIds((prev) => prev.filter((id) => id !== row.id));
                            }
                          }}
                          className="rounded border-[var(--dm-border)]"
                        />
                        {row.name}
                      </label>
                    );
                  })
                )}
              </div>
            </div>
            <div className="mt-4">
              <button
                type="button"
                disabled={bulkBusy || bulkStaffIds.length === 0}
                onClick={() => void applyBulkStaffLinks()}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${gate.platform.accentClassName} ${gate.platform.hoverClassName}`}
              >
                {bulkBusy ? "…" : c.bulkApply}
              </button>
            </div>
          </div>
        ) : null}
        <div className="mt-4 space-y-4">
          {staff.length === 0 ? (
            <p className="text-sm text-[var(--dm-text-muted)]">{st.empty}</p>
          ) : (
            staff.map((person) => {
              const links = linksByStaff[person.id] ?? { ...EMPTY_LINKS, staff_id: person.id };
              const busy = Boolean(linksBusyByStaff[person.id]);
              return (
                <div key={person.id} className="rounded-lg border border-[var(--dm-border)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-[var(--dm-text)]">{person.name}</p>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void saveStaffLinks(person.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 ${gate.platform.accentClassName} ${gate.platform.hoverClassName}`}
                    >
                      {busy ? "…" : c.staffLinksSave}
                    </button>
                  </div>
                  <label className="mt-3 flex items-center gap-2 text-sm text-[var(--dm-text-secondary)]">
                    <input
                      type="checkbox"
                      checked={links.staff_covers_all_courses}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setStaffLinkState(person.id, {
                          staff_covers_all_courses: checked,
                          course_ids: checked ? [] : links.course_ids,
                        });
                      }}
                      className="rounded border-[var(--dm-border)]"
                    />
                    {c.staffCoversAllCourses}
                  </label>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {sortedCourses.length === 0 ? (
                      <p className="text-xs text-[var(--dm-text-muted)]">{c.empty}</p>
                    ) : (
                      sortedCourses.map((row) => {
                        const checked = links.course_ids.includes(row.id);
                        return (
                          <label
                            key={`${person.id}-${row.id}`}
                            className="flex items-center gap-2 text-xs text-[var(--dm-text-secondary)]"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={links.staff_covers_all_courses}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...links.course_ids, row.id]
                                  : links.course_ids.filter((id) => id !== row.id);
                                setStaffLinkState(person.id, { course_ids: Array.from(new Set(next)) });
                              }}
                              className="rounded border-[var(--dm-border)]"
                            />
                            {row.name}
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
