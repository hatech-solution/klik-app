"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ConfirmModal } from "@/components/common/confirm-modal";
import { useStoreSettingsGate } from "@/components/platform/store-settings-context";
import { BookingListSkeleton } from "@/components/ui/screen-loading-skeletons";
import { fetchBookings, fetchBookingSummary, updateBookingStatus } from "@/lib/api/store/client";
import type {
  BookingApiItem,
  BookingListMeta,
  BookingStatus,
  BookingSummaryResponse,
} from "@/lib/api/store/types";
import { getMessages, type Locale } from "@/lib/i18n";
import { notifyError, notifySuccess } from "@/lib/toast";

type Props = {
  locale: Locale;
};

/* ---------- helpers ---------- */

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, n: number) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function formatSlotTime(iso: string) {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm} ${hh}:${mi}`;
}

const STATUS_BADGE: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  arrived: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  in_progress: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  completed: "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const TRANSITIONS: Record<string, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["arrived", "in_progress", "completed", "cancelled"],
  arrived: ["in_progress", "completed", "cancelled"],
  in_progress: ["completed"],
};

const PLATFORM_ICONS: Record<string, string> = {
  line: "LINE",
  zalo: "Zalo",
  telegram: "TG",
  instagram: "IG",
};

/* ---------- component ---------- */

export function StoreBookingsPlaceholderClient({ locale }: Props) {
  const gate = useStoreSettingsGate();
  const t = getMessages(locale);
  const td = t.storeDashboard;

  // date range state (default = this week Mon-Sun)
  const [fromDate, setFromDate] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const mon = new Date(today);
    mon.setDate(today.getDate() - diff);
    return mon.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => addDays(fromDate, 6));

  // filter state
  const [statusFilter, setStatusFilter] = useState<string>("");

  // data state
  const [bookings, setBookings] = useState<BookingApiItem[]>([]);
  const [meta, setMeta] = useState<BookingListMeta | null>(null);
  const [summary, setSummary] = useState<BookingSummaryResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // status update state
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // cancel modal state
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelBusy, setCancelBusy] = useState(false);

  const botId = gate?.botId ?? "";
  const storeId = gate?.storeId ?? "";

  const statusLabel = useCallback(
    (s: BookingStatus): string => {
      const map: Record<BookingStatus, string> = {
        pending: td.bookingsStatusPending,
        confirmed: td.bookingsStatusConfirmed,
        arrived: td.bookingsStatusArrived,
        in_progress: td.bookingsStatusInProgress,
        completed: td.bookingsStatusCompleted,
        cancelled: td.bookingsStatusCancelled,
      };
      return map[s] ?? s;
    },
    [td],
  );

  const actionLabel = useCallback(
    (s: BookingStatus): string => {
      const map: Record<string, string> = {
        confirmed: td.bookingsActionConfirm,
        arrived: td.bookingsActionArrived,
        in_progress: td.bookingsActionStart,
        completed: td.bookingsActionComplete,
        cancelled: td.bookingsActionCancel,
      };
      return map[s] ?? s;
    },
    [td],
  );

  // Load bookings
  const loadData = useCallback(async () => {
    if (!botId || !storeId) return;
    setLoading(true);
    try {
      const [listRes, summaryRes] = await Promise.all([
        fetchBookings(botId, storeId, {
          from_date: fromDate,
          to_date: toDate,
          status: statusFilter || undefined,
          page,
          page_size: 20,
        }),
        fetchBookingSummary(botId, storeId, fromDate, toDate),
      ]);
      setBookings(listRes.data);
      setMeta(listRes.meta);
      setSummary(summaryRes.data);
    } catch {
      notifyError(td.bookingsLoadFailed);
    } finally {
      setLoading(false);
    }
  }, [botId, storeId, fromDate, toDate, statusFilter, page, td.bookingsLoadFailed]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadData();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [loadData]);

  // Handle status change
  const handleStatusChange = useCallback(
    async (bookingId: string, newStatus: BookingStatus) => {
      if (newStatus === "cancelled") {
        setCancelTarget(bookingId);
        return;
      }
      setUpdatingId(bookingId);
      try {
        await updateBookingStatus(botId, storeId, bookingId, { status: newStatus });
        notifySuccess(td.bookingsStatusUpdateSuccess);
        await loadData();
      } catch {
        notifyError(td.bookingsStatusUpdateFailed);
      } finally {
        setUpdatingId(null);
      }
    },
    [botId, storeId, td, loadData],
  );

  const confirmCancel = useCallback(async () => {
    if (!cancelTarget) return;
    setCancelBusy(true);
    try {
      await updateBookingStatus(botId, storeId, cancelTarget, { status: "cancelled" });
      notifySuccess(td.bookingsStatusUpdateSuccess);
      setCancelTarget(null);
      await loadData();
    } catch {
      notifyError(td.bookingsStatusUpdateFailed);
    } finally {
      setCancelBusy(false);
    }
  }, [botId, storeId, cancelTarget, td, loadData]);

  // Navigation
  const goWeek = useCallback(
    (dir: number) => {
      const newFrom = addDays(fromDate, dir * 7);
      const newTo = addDays(newFrom, 6);
      setFromDate(newFrom);
      setToDate(newTo);
      setPage(1);
    },
    [fromDate],
  );

  const goToday = useCallback(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const mon = new Date(today);
    mon.setDate(today.getDate() - diff);
    const newFrom = mon.toISOString().slice(0, 10);
    setFromDate(newFrom);
    setToDate(addDays(newFrom, 6));
    setPage(1);
  }, []);

  const isCurrentWeek = useMemo(() => {
    const today = todayISO();
    return today >= fromDate && today <= toDate;
  }, [fromDate, toDate]);

  if (!gate) {
    return null;
  }

  const totalPages = meta?.total_pages ?? 1;

  const allStatuses: BookingStatus[] = [
    "pending",
    "confirmed",
    "arrived",
    "in_progress",
    "completed",
    "cancelled",
  ];

  return (
    <div className="dm-overview-panel space-y-4">
      {/* Header */}
      <h2 className="text-lg font-semibold text-[var(--dm-text)]">{td.bookingsPageTitle}</h2>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          <div className="rounded-lg border border-[var(--dm-border)] bg-[var(--dm-surface)] p-3 text-center">
            <div className="text-xs text-[var(--dm-text-muted)]">{td.bookingsSummaryTotal}</div>
            <div className="text-xl font-bold text-[var(--dm-text)]">{summary.total}</div>
          </div>
          {allStatuses.map((s) => (
            <div
              key={s}
              className="rounded-lg border border-[var(--dm-border)] bg-[var(--dm-surface)] p-3 text-center"
            >
              <div className="text-xs text-[var(--dm-text-muted)]">{statusLabel(s)}</div>
              <div className="text-xl font-bold text-[var(--dm-text)]">
                {summary.by_status[s] ?? 0}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Date navigation */}
        <button
          type="button"
          onClick={() => goWeek(-1)}
          className="rounded border border-[var(--dm-border)] bg-[var(--dm-surface)] px-2 py-1 text-xs text-[var(--dm-text)]"
        >
          {td.bookingsPrev}
        </button>
        <span className="text-sm font-medium text-[var(--dm-text)]">
          {fromDate} — {toDate}
        </span>
        <button
          type="button"
          onClick={() => goWeek(1)}
          className="rounded border border-[var(--dm-border)] bg-[var(--dm-surface)] px-2 py-1 text-xs text-[var(--dm-text)]"
        >
          {td.bookingsNext}
        </button>
        {!isCurrentWeek && (
          <button
            type="button"
            onClick={goToday}
            className="rounded border border-[var(--dm-border)] bg-[var(--dm-surface)] px-2 py-1 text-xs text-[var(--dm-text)]"
          >
            {locale === "vi" ? "Hôm nay" : "Today"}
          </button>
        )}

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded border border-[var(--dm-border)] bg-[var(--dm-control-bg)] px-2 py-1 text-xs text-[var(--dm-text)]"
        >
          <option value="">{td.bookingsFilterAll}</option>
          {allStatuses.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <BookingListSkeleton />
      ) : bookings.length === 0 ? (
        <div className="rounded-lg border border-[var(--dm-border)] bg-[var(--dm-surface)] p-8 text-center">
          <p className="text-sm text-[var(--dm-text-muted)]">{td.bookingsPlaceholder}</p>
          <p className="mt-1 text-xs text-[var(--dm-text-muted)]">{td.bookingsHint}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-[var(--dm-border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--dm-border)] bg-[var(--dm-surface)]">
                  <th className="px-3 py-2 text-left font-medium text-[var(--dm-text-secondary)]">
                    {td.bookingsColTime}
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-[var(--dm-text-secondary)]">
                    {td.bookingsColCustomer}
                  </th>
                  <th className="hidden px-3 py-2 text-left font-medium text-[var(--dm-text-secondary)] sm:table-cell">
                    {td.bookingsColCourse}
                  </th>
                  <th className="hidden px-3 py-2 text-left font-medium text-[var(--dm-text-secondary)] md:table-cell">
                    {td.bookingsColStaff}
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-[var(--dm-text-secondary)]">
                    {td.bookingsColStatus}
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-[var(--dm-text-secondary)]">
                    {td.bookingsColAction}
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const transitions = TRANSITIONS[b.status] ?? [];
                  const isUpdating = updatingId === b.id;

                  return (
                    <tr
                      key={b.id}
                      className="border-b border-[var(--dm-border)] last:border-b-0 hover:bg-[var(--dm-surface)]"
                    >
                      <td className="whitespace-nowrap px-3 py-2 text-[var(--dm-text)]">
                        {formatSlotTime(b.starts_at)}–{formatSlotTime(b.ends_at).split(" ")[1]}
                      </td>
                      <td className="px-3 py-2 text-[var(--dm-text)]">
                        <span className="mr-1 inline-block rounded bg-slate-200 px-1 text-[10px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          {PLATFORM_ICONS[b.platform_provider] ?? b.platform_provider}
                        </span>
                        <span className="text-xs">{b.platform_user_id}</span>
                      </td>
                      <td className="hidden px-3 py-2 text-[var(--dm-text)] sm:table-cell">
                        {b.course?.name ?? td.bookingsNone}
                      </td>
                      <td className="hidden px-3 py-2 text-[var(--dm-text)] md:table-cell">
                        {b.staff?.name ?? td.bookingsNone}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[b.status] ?? ""}`}
                        >
                          {statusLabel(b.status)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {transitions.length > 0 && !isUpdating && (
                          <div className="flex justify-end gap-1">
                            {transitions.map((next) => (
                              <button
                                key={next}
                                type="button"
                                onClick={() => handleStatusChange(b.id, next)}
                                className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                                  next === "cancelled"
                                    ? "border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                    : "border border-[var(--dm-border)] text-[var(--dm-text)] hover:bg-[var(--dm-surface)]"
                                }`}
                              >
                                {actionLabel(next)}
                              </button>
                            ))}
                          </div>
                        )}
                        {isUpdating && (
                          <span className="text-xs text-[var(--dm-text-muted)]">…</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-[var(--dm-text-muted)]">
            <span>{td.bookingsTotalItems(meta?.total_items ?? 0)}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded border border-[var(--dm-border)] px-2 py-1 disabled:opacity-40"
              >
                {td.bookingsPrev}
              </button>
              <span>{td.bookingsPageInfo(page, totalPages)}</span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border border-[var(--dm-border)] px-2 py-1 disabled:opacity-40"
              >
                {td.bookingsNext}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Cancel confirmation modal */}
      <ConfirmModal
        open={cancelTarget !== null}
        title={td.bookingsCancelModalTitle}
        description={td.bookingsCancelModalDesc}
        cancelLabel={t.common.confirmModal.cancel}
        confirmLabel={td.bookingsActionCancel}
        busyConfirmLabel={t.common.confirmModal.processing}
        confirmVariant="danger"
        busy={cancelBusy}
        errorMessage={null}
        onCancel={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
      />
    </div>
  );
}
