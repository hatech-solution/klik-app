"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Locale, getMessages } from "@/lib/i18n";
import { PlatformConfig } from "@/lib/platforms";
import type { Bot } from "@/lib/types/bot";
import type {
  Store,
  StoreBusinessStatus,
  StoreVerificationStatus,
} from "@/lib/types/store";
import {
  fetchStores,
  fetchRegions,
  createStore,
  updateStore,
  deleteStore,
} from "@/lib/api/store/client";
import type { RegionApiItem } from "@/lib/api/store/types";
import { ApiClientError, getErrorMessageByKey } from "@/lib/api/error";
import { ConfirmModal } from "@/components/common/confirm-modal";
import {
  resolveStoreSubmitErrors,
  type StoreFormField,
} from "@/lib/api/store/form-field-errors";
import { notifyError, notifySuccess } from "@/lib/toast";
import { isValidEmail, isValidPhoneNumber } from "@/lib/utils/validation";

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
  
  const [showModal, setShowModal] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<StoreFormField, string>>>({});
  
  // Form states
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [googleMapUrl, setGoogleMapUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [regions, setRegions] = useState<RegionApiItem[]>([]);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [regionCode, setRegionCode] = useState("VN");
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const [currencyCode, setCurrencyCode] = useState("VND");

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setRegionsLoading(true);
    void (async () => {
      try {
        const list = await fetchRegions();
        if (mounted) setRegions(list);
      } catch {
        if (mounted) notifyError(getMessages(locale).toast.loadRegionsFailed);
      } finally {
        if (mounted) setRegionsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [locale]);

  useEffect(() => {
    let mounted = true;
    async function loadStores() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchStores(selectedBot.id);
        if (!mounted) return;
        // Map StoreApiItem to Store model
        const mappedStores: Store[] = data.map((d) => ({
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
        }));
        setStores(mappedStores);
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

  function applyRegionDefaults(code: string, list: RegionApiItem[]) {
    const row = list.find((x) => x.region_code === code);
    if (row) {
      setTimezone(row.default_timezone);
      setCurrencyCode(row.default_currency);
    }
  }

  function openAddModal() {
    setEditingStoreId(null);
    setName("");
    setRegionCode("VN");
    applyRegionDefaults("VN", regions.length > 0 ? regions : [{ region_code: "VN", default_timezone: "Asia/Ho_Chi_Minh", default_currency: "VND" }]);
    setAddress("");
    setPhone("");
    setEmail("");
    setDescription("");
    setYoutubeUrl("");
    setFacebookUrl("");
    setGoogleMapUrl("");
    setWebsiteUrl("");
    setFormError(null);
    setFieldErrors({});
    setShowModal(true);
  }

  function openEditModal(store: Store) {
    setEditingStoreId(store.id);
    setName(store.name);
    setRegionCode(store.regionCode);
    setTimezone(store.timezone);
    setCurrencyCode(store.currencyCode);
    setAddress(store.address || "");
    setPhone(store.phoneNumber || "");
    setEmail(store.email || "");
    setDescription(store.description || "");
    setYoutubeUrl(store.youtubeUrl || "");
    setFacebookUrl(store.facebookUrl || "");
    setGoogleMapUrl(store.googleMapUrl || "");
    setWebsiteUrl(store.websiteUrl || "");
    setFormError(null);
    setFieldErrors({});
    setShowModal(true);
  }

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const normalizedPhone = phone.trim();
    const normalizedEmail = email.trim();

    if (normalizedPhone.length > 50) {
      setFieldErrors({});
      setFormError(t.store.validation.phoneTooLong);
      return;
    }
    if (normalizedPhone && !isValidPhoneNumber(normalizedPhone)) {
      setFieldErrors({});
      setFormError(t.store.validation.phoneInvalid);
      return;
    }
    if (normalizedEmail.length > 255) {
      setFieldErrors({});
      setFormError(t.store.validation.emailTooLong);
      return;
    }
    if (normalizedEmail && !isValidEmail(normalizedEmail)) {
      setFieldErrors({});
      setFormError(t.store.validation.emailInvalid);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    const payload = {
      name: name.trim(),
      region_code: regionCode.trim(),
      timezone: timezone.trim(),
      currency_code: currencyCode.trim().toUpperCase(),
      address: address.trim() || null,
      phone_number: normalizedPhone || null,
      email: normalizedEmail || null,
      description: description.trim() || null,
      youtube_url: youtubeUrl.trim() || null,
      facebook_url: facebookUrl.trim() || null,
      google_map_url: googleMapUrl.trim() || null,
      website_url: websiteUrl.trim() || null,
    };

    try {
      let savedApiStore;
      if (editingStoreId) {
        savedApiStore = await updateStore(selectedBot.id, editingStoreId, payload);
      } else {
        savedApiStore = await createStore(selectedBot.id, payload);
      }

      const savedStore: Store = {
        id: savedApiStore.id,
        name: savedApiStore.name,
        regionCode: savedApiStore.region_code,
        timezone: savedApiStore.timezone,
        currencyCode: savedApiStore.currency_code,
        address: savedApiStore.address,
        phoneNumber: savedApiStore.phone_number,
        email: savedApiStore.email,
        description: savedApiStore.description,
        primaryImageUrl: savedApiStore.primary_image_url,
        slideImageUrls: savedApiStore.slide_image_urls,
        youtubeUrl: savedApiStore.youtube_url,
        facebookUrl: savedApiStore.facebook_url,
        googleMapUrl: savedApiStore.google_map_url,
        websiteUrl: savedApiStore.website_url,
        businessStatus: savedApiStore.business_status as StoreBusinessStatus,
        verificationStatus: savedApiStore.verification_status as StoreVerificationStatus,
      };

      if (editingStoreId) {
        setStores((prev) => prev.map((s) => (s.id === editingStoreId ? savedStore : s)));
        notifySuccess(t.toast.storeUpdated);
      } else {
        setStores((prev) => [...prev, savedStore]);
        notifySuccess(t.toast.storeCreated);
      }
      setShowModal(false);
      setFieldErrors({});
    } catch (err) {
      if (err instanceof ApiClientError) {
        const errorByKey = t.store.errorByKey as Record<string, string>;
        const { banner, fieldErrors: nextFieldErrors } = resolveStoreSubmitErrors(
          err,
          errorByKey,
          t.store.validation.fixHighlightedFields,
          t.store.unexpectedError,
        );
        setFormError(banner);
        setFieldErrors(nextFieldErrors);
      } else {
        setFormError(t.store.unexpectedError);
        setFieldErrors({});
      }
    } finally {
      setSubmitting(false);
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

  const fieldBorderClass = (field: StoreFormField) =>
    fieldErrors[field]
      ? "border-red-500 focus:border-red-500"
      : "border-slate-300 focus:border-slate-500";

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
        <h3 className="text-xl font-semibold text-slate-900">
          {t.dashboard.section.store.title}
        </h3>
        <button
          onClick={openAddModal}
          className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium ${platform.accentClassName} ${platform.hoverClassName}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {t.store.addStore}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">{t.store.loadingStoreList}</div>
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
                <th className="px-4 py-3 font-medium text-right">{t.store.actions}</th>
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
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 2" />
                        </svg>
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEditModal(store)}
                        className="mr-3 text-slate-400 hover:text-slate-700"
                        title={t.store.editStore}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteConfirm(store.id)}
                        className="text-slate-400 hover:text-red-600"
                        title={t.store.deleteStore}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
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

      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => {
            setShowModal(false);
            setFormError(null);
            setFieldErrors({});
          }}
        >
          <div 
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-6 text-xl font-semibold text-slate-900">
              {editingStoreId ? t.store.editStore : t.store.addStore}
            </h3>
            
            {formError && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {t.store.name} *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${fieldBorderClass("name")}`}
                  required
                />
                {fieldErrors.name ? (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
                ) : null}
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-800">{t.store.bookingLocaleTitle}</p>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {t.store.region}
                </label>
                <select
                  value={regionCode}
                  disabled={regionsLoading}
                  onChange={(e) => {
                    const v = e.target.value;
                    setRegionCode(v);
                    applyRegionDefaults(v, regions.length > 0 ? regions : []);
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100 ${fieldBorderClass("regionCode")}`}
                >
                  {(regions.length > 0
                    ? regions
                    : [{ region_code: "VN", default_timezone: "Asia/Ho_Chi_Minh", default_currency: "VND" }]
                  ).map((r) => (
                    <option key={r.region_code} value={r.region_code}>
                      {r.region_code}
                    </option>
                  ))}
                </select>
                {fieldErrors.regionCode ? (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.regionCode}</p>
                ) : null}
                <p className="mt-1 text-xs text-slate-500">{t.store.regionHint}</p>
                {regionsLoading ? (
                  <p className="mt-2 text-xs text-slate-500">{t.store.loadingRegions}</p>
                ) : null}

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      {t.store.timezone}
                    </label>
                    <input
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      maxLength={64}
                      className={`w-full rounded-lg border px-3 py-2 font-mono text-sm outline-none ${fieldBorderClass("timezone")}`}
                    />
                    {fieldErrors.timezone ? (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.timezone}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      {t.store.currency}
                    </label>
                    <input
                      value={currencyCode}
                      onChange={(e) => setCurrencyCode(e.target.value.toUpperCase().slice(0, 3))}
                      maxLength={3}
                      className={`w-full rounded-lg border px-3 py-2 font-mono text-sm outline-none ${fieldBorderClass("currencyCode")}`}
                    />
                    {fieldErrors.currencyCode ? (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.currencyCode}</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {t.store.address}
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${fieldBorderClass("address")}`}
                />
                {fieldErrors.address ? (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.address}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    {t.store.phone}
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${fieldBorderClass("phone")}`}
                  />
                  {fieldErrors.phone ? (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
                  ) : null}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    {t.store.email}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${fieldBorderClass("email")}`}
                  />
                  {fieldErrors.email ? (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {t.store.description}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="..."
                  rows={2}
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${fieldBorderClass("description")}`}
                />
                {fieldErrors.description ? (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.description}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    {t.store.youtubeUrl}
                  </label>
                  <input
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${fieldBorderClass("youtubeUrl")}`}
                  />
                  {fieldErrors.youtubeUrl ? (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.youtubeUrl}</p>
                  ) : null}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    {t.store.facebookUrl}
                  </label>
                  <input
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${fieldBorderClass("facebookUrl")}`}
                  />
                  {fieldErrors.facebookUrl ? (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.facebookUrl}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    {t.store.googleMapUrl}
                  </label>
                  <input
                    value={googleMapUrl}
                    onChange={(e) => setGoogleMapUrl(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${fieldBorderClass("googleMapUrl")}`}
                  />
                  {fieldErrors.googleMapUrl ? (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.googleMapUrl}</p>
                  ) : null}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    {t.store.websiteUrl}
                  </label>
                  <input
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${fieldBorderClass("websiteUrl")}`}
                  />
                  {fieldErrors.websiteUrl ? (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.websiteUrl}</p>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormError(null);
                    setFieldErrors({});
                  }}
                  disabled={submitting}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  {t.store.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`rounded-lg px-6 py-2 text-sm font-medium disabled:opacity-50 ${platform.accentClassName} ${platform.hoverClassName}`}
                >
                  {submitting ? "..." : t.store.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
