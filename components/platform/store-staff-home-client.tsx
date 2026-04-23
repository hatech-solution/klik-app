"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ConfirmModal } from "@/components/common/confirm-modal";
import { useStoreSettingsGate } from "@/components/platform/store-settings-context";
import { LoadingRegion, StoreTableSkeleton } from "@/components/ui/screen-loading-skeletons";
import {
  deleteStaff,
  fetchStaffList,
  fetchStaffSettings,
  putStaffSettings,
} from "@/lib/api/store/client";
import type { StaffApiItem, StaffSettingsApiItem } from "@/lib/api/store/types";
import { ApiClientError, getErrorMessageByKey } from "@/lib/api/error";
import { getMessages, type Locale } from "@/lib/i18n";
import { notifyError, notifySuccess } from "@/lib/toast";

type Props = {
  locale: Locale;
};

export function StoreStaffHomeClient({ locale }: Props) {
  const gate = useStoreSettingsGate();
  const t = getMessages(locale);
  const st = t.store.staff;
  const errorByKey = t.store.errorByKey as Record<string, string>;

  const [staff, setStaff] = useState<StaffApiItem[]>([]);
  const [settings, setSettings] = useState<StaffSettingsApiItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  const [requireStaff, setRequireStaff] = useState(false);
  const [hidePrice, setHidePrice] = useState(false);
  const [maxConcurrent, setMaxConcurrent] = useState("");

  const load = useCallback(async () => {
    if (!gate) return;
    setLoading(true);
    setBanner(null);
    try {
      const [list, cfg] = await Promise.all([
        fetchStaffList(gate.botId, gate.storeId),
        fetchStaffSettings(gate.botId, gate.storeId),
      ]);
      setStaff(list);
      setSettings(cfg);
      setRequireStaff(cfg.require_staff_on_booking);
      setHidePrice(cfg.hide_staff_price_on_public);
      setMaxConcurrent(
        cfg.max_concurrent_staff_bookings_per_slot != null
          ? String(cfg.max_concurrent_staff_bookings_per_slot)
          : "",
      );
    } catch (err) {
      setBanner(t.toast.loadStaffFailed);
      notifyError(t.toast.loadStaffFailed);
      if (err instanceof ApiClientError) {
        setBanner(getErrorMessageByKey(err, t.toast.loadStaffFailed, errorByKey));
      }
    } finally {
      setLoading(false);
    }
  }, [gate, errorByKey, t.toast.loadStaffFailed]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveSettings() {
    if (!gate) return;
    setSettingsBusy(true);
    setBanner(null);
    const raw = maxConcurrent.trim();
    let cap: number | null | undefined = undefined;
    if (raw === "") {
      cap = null;
    } else {
      const n = Number(raw);
      if (!Number.isFinite(n) || n <= 0) {
        setBanner(st.settingsMaxConcurrentHint);
        setSettingsBusy(false);
        return;
      }
      cap = Math.floor(n);
    }
    try {
      const next = await putStaffSettings(gate.botId, gate.storeId, {
        require_staff_on_booking: requireStaff,
        hide_staff_price_on_public: hidePrice,
        max_concurrent_staff_bookings_per_slot: cap,
      });
      setSettings(next);
      notifySuccess(t.toast.staffSettingsSaved);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setBanner(getErrorMessageByKey(err, st.settingsLoadFailed, errorByKey));
      } else {
        setBanner(st.settingsLoadFailed);
      }
    } finally {
      setSettingsBusy(false);
    }
  }

  async function confirmDelete() {
    if (!gate || !deleteId) return;
    setDeleteBusy(true);
    setDeleteErr(null);
    try {
      await deleteStaff(gate.botId, gate.storeId, deleteId);
      setStaff((prev) => prev.filter((s) => s.id !== deleteId));
      setDeleteId(null);
      notifySuccess(t.toast.staffDeleted);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setDeleteErr(getErrorMessageByKey(err, st.deleteFailed, errorByKey));
      } else {
        setDeleteErr(st.deleteFailed);
      }
    } finally {
      setDeleteBusy(false);
    }
  }

  if (!gate) {
    return null;
  }

  const base = `/${locale}/store/${gate.storeId}/staff`;

  return (
    <div className="space-y-8">
      <ConfirmModal
        open={deleteId !== null}
        title={st.deleteModalTitle}
        description={st.deleteConfirm}
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
          <h2 className="text-lg font-semibold text-[var(--dm-text)]">{st.pageTitle}</h2>
          <p className="mt-1 text-sm text-[var(--dm-text-muted)]">{st.pageSubtitle}</p>
        </div>
        <Link
          href={`${base}/new`}
          className={`inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-white ${gate.platform.accentClassName} ${gate.platform.hoverClassName}`}
        >
          + {st.addStaff}
        </Link>
      </div>

      {banner ? <div className="dm-form-error-banner">{banner}</div> : null}

      <section className="dm-overview-panel">
        <h3 className="text-sm font-semibold text-[var(--dm-text)]">{st.settingsTitle}</h3>
        <div className="mt-4 space-y-4">
          <label className="flex items-center gap-2 text-sm text-[var(--dm-text-secondary)]">
            <input
              type="checkbox"
              checked={requireStaff}
              onChange={(e) => setRequireStaff(e.target.checked)}
              className="rounded border-[var(--dm-border)]"
            />
            {st.settingsRequireStaff}
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--dm-text-secondary)]">
            <input
              type="checkbox"
              checked={hidePrice}
              onChange={(e) => setHidePrice(e.target.checked)}
              className="rounded border-[var(--dm-border)]"
            />
            {st.settingsHidePrice}
          </label>
          <div>
            <label className="dm-label mb-1 block text-xs" htmlFor="staff-max-concurrent">
              {st.settingsMaxConcurrent}
            </label>
            <input
              id="staff-max-concurrent"
              type="number"
              min={1}
              step={1}
              value={maxConcurrent}
              onChange={(e) => setMaxConcurrent(e.target.value)}
              placeholder="—"
              className="dm-input max-w-xs"
            />
            <p className="mt-1 text-xs text-[var(--dm-text-muted)]">{st.settingsMaxConcurrentHint}</p>
          </div>
          <button
            type="button"
            disabled={settingsBusy || !settings}
            onClick={() => void saveSettings()}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${gate.platform.accentClassName} ${gate.platform.hoverClassName}`}
          >
            {settingsBusy ? "…" : st.settingsSave}
          </button>
        </div>
      </section>

      <div className="dm-table-wrap overflow-hidden rounded-xl">
        {loading ? (
          <LoadingRegion aria-label={st.loading} className="p-4 sm:p-6">
            <StoreTableSkeleton />
          </LoadingRegion>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm text-[var(--dm-text-secondary)]">
              <thead className="dm-thead">
                <tr>
                  <th className="px-4 py-3 font-medium">{st.tableName}</th>
                  <th className="px-4 py-3 font-medium">{st.tableVisible}</th>
                  <th className="px-4 py-3 font-medium">{st.tablePrice}</th>
                  <th className="px-4 py-3 font-medium">{st.tableSort}</th>
                  <th className="px-4 py-3 text-right font-medium">{st.tableActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dm-border)]">
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[var(--dm-text-muted)]">
                      {st.empty}
                    </td>
                  </tr>
                ) : (
                  staff.map((row) => (
                    <tr key={row.id} className="dm-tbody-row">
                      <td className="px-4 py-3 font-medium text-[var(--dm-text)]">{row.name}</td>
                      <td className="px-4 py-3">{row.is_visible ? st.visibleYes : st.visibleNo}</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {row.price != null ? String(row.price) : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{row.sort_order}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`${base}/${row.id}/hours`}
                          className="mr-3 inline-flex text-[var(--dm-text-muted)] hover:text-[var(--dm-text)]"
                          title={st.editHours}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09c.68 0 1.29-.39 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06c.46.46 1.12.6 1.82.33h.01c.63-.26 1-.87 1-1.51V3a2 2 0 0 1 4 0v.09c0 .68.39 1.29 1 1.51.7.27 1.36.13 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82c.26.63.87 1 1.51 1H21a2 2 0 0 1 0 4h-.09c-.68 0-1.29.39-1.51 1z" />
                          </svg>
                        </Link>
                        <Link
                          href={`${base}/${row.id}/edit`}
                          className="mr-3 inline-flex text-[var(--dm-text-muted)] hover:text-[var(--dm-text)]"
                          title={st.editProfile}
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
                          title={st.deleteStaff}
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
        )}
      </div>
    </div>
  );
}
