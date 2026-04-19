"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ApiClientError, getErrorMessageByKey } from "@/lib/api/error";
import { fetchStores, deleteStore } from "@/lib/api/store/client";
import { mapStoreApiItemToStore } from "@/lib/api/store/map-store";
import { ConfirmModal } from "@/components/common/confirm-modal";
import { LoadingRegion, StoreTableSkeleton } from "@/components/ui/screen-loading-skeletons";
import { getMessages, type Locale } from "@/lib/i18n";
import type { PlatformConfig } from "@/lib/platforms";
import type { Bot } from "@/lib/types/bot";
import type { Store, StoreBusinessStatus } from "@/lib/types/store";
import { notifyError, notifySuccess } from "@/lib/toast";

type StoreManagementProps = {
  locale: Locale;
  platform: PlatformConfig;
  selectedBot: Bot;
};

export function StoreManagement({ locale, platform, selectedBot }: StoreManagementProps) {
  const t = getMessages(locale);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadStores() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchStores(selectedBot.id);
        if (!mounted) return;
        setStores(data.map(mapStoreApiItemToStore));
      } catch {
        if (!mounted) return;
        const loadErr = getMessages(locale).toast.loadStoresFailed;
        setError(loadErr);
        notifyError(loadErr);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadStores();
    return () => {
      mounted = false;
    };
  }, [selectedBot.id, locale]);

  function openDeleteConfirm(id: string) {
    setDeleteError(null);
    setDeleteTargetId(id);
  }

  function closeDeleteModal() {
    if (deleteBusy) return;
    setDeleteTargetId(null);
    setDeleteError(null);
  }

  async function confirmDeleteStore() {
    if (deleteTargetId == null) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await deleteStore(selectedBot.id, deleteTargetId);
      setStores((prev) => prev.filter((s) => s.id !== deleteTargetId));
      setDeleteTargetId(null);
      notifySuccess(t.toast.storeDeleted);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setDeleteError(
          getErrorMessageByKey(
            err,
            t.store.deleteFailed,
            t.store.errorByKey as Record<string, string>,
          ),
        );
      } else {
        setDeleteError(t.store.deleteFailed);
      }
    } finally {
      setDeleteBusy(false);
    }
  }

  const getStatusText = (st: StoreBusinessStatus) => {
    switch (st) {
      case "active":
        return t.store.active;
      case "temporarily_closed":
        return t.store.temporarilyClosed;
      case "stopped_business":
        return t.store.stoppedBusiness;
      default:
        return st;
    }
  };

  const getStatusClass = (st: StoreBusinessStatus) => {
    switch (st) {
      case "active":
        return "bg-emerald-100 text-emerald-700";
      case "temporarily_closed":
        return "bg-amber-100 text-amber-700";
      case "stopped_business":
        return "bg-slate-100 text-slate-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="space-y-4">
      <ConfirmModal
        open={deleteTargetId !== null}
        title={t.store.deleteModalTitle}
        description={t.store.deleteConfirm}
        cancelLabel={t.common.confirmModal.cancel}
        confirmLabel={t.common.confirmModal.deleteAction}
        busyConfirmLabel={t.common.confirmModal.processing}
        confirmVariant="danger"
        busy={deleteBusy}
        errorMessage={deleteError}
        onCancel={closeDeleteModal}
        onConfirm={confirmDeleteStore}
      />

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900">{t.dashboard.section.store.title}</h3>
        <Link
          href={`/${locale}/dashboard/store/new`}
          className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium ${platform.accentClassName} ${platform.hoverClassName}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t.store.addStore}
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <LoadingRegion aria-label={t.store.loadingStoreList} className="p-4 sm:p-6">
            <StoreTableSkeleton />
          </LoadingRegion>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-medium">{t.store.name}</th>
                  <th className="px-4 py-3 font-medium">{t.store.region}</th>
                  <th className="px-4 py-3 font-medium">{t.store.timezone}</th>
                  <th className="px-4 py-3 font-medium">{t.store.address}</th>
                  <th className="px-4 py-3 font-medium">{t.store.phone}</th>
                  <th className="px-4 py-3 font-medium">{t.store.status}</th>
                  <th className="px-4 py-3 text-right font-medium">{t.store.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {stores.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      {t.store.emptyStoreList}
                    </td>
                  </tr>
                ) : (
                  stores.map((store) => (
                    <tr key={store.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{store.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">
                        {store.regionCode} · {store.currencyCode}
                      </td>
                      <td
                        className="max-w-40 truncate px-4 py-3 font-mono text-xs text-slate-500"
                        title={store.timezone}
                      >
                        {store.timezone}
                      </td>
                      <td className="px-4 py-3">{store.address || "-"}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{store.phoneNumber || "-"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusClass(store.businessStatus)}`}
                        >
                          {getStatusText(store.businessStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/${locale}/dashboard/stores/${store.id}/settings/hours`}
                          className="mr-3 inline-flex text-slate-400 hover:text-slate-700"
                          title={t.store.openingHours}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09c.68 0 1.29-.39 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06c.46.46 1.12.6 1.82.33h.01c.63-.26 1-.87 1-1.51V3a2 2 0 0 1 4 0v.09c0 .68.39 1.29 1 1.51.7.27 1.36.13 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82c.26.63.87 1 1.51 1H21a2 2 0 0 1 0 4h-.09c-.68 0-1.29.39-1.51 1z" />
                          </svg>
                        </Link>
                        <Link
                          href={`/${locale}/dashboard/store/${store.id}/edit`}
                          className="mr-3 inline-flex text-slate-400 hover:text-slate-700"
                          title={t.store.editStore}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        </Link>
                        <button
                          type="button"
                          onClick={() => openDeleteConfirm(store.id)}
                          className="text-slate-400 hover:text-red-600"
                          title={t.store.deleteStore}
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
