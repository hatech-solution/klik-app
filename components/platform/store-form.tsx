"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

import { ApiClientError } from "@/lib/api/error";
import { createMediaUploadAuth, uploadImageToImageKit } from "@/lib/api/media/client";
import {
  createStore,
  fetchRegions,
  updateStore,
} from "@/lib/api/store/client";
import {
  resolveStoreSubmitErrors,
  type StoreFormField,
} from "@/lib/api/store/form-field-errors";
import type { RegionApiItem } from "@/lib/api/store/types";
import { getMessages, type Locale } from "@/lib/i18n";
import type { PlatformConfig } from "@/lib/platforms";
import type { Bot } from "@/lib/types/bot";
import type { Store } from "@/lib/types/store";
import { Skeleton } from "@/components/ui/skeleton";
import { notifyError, notifySuccess } from "@/lib/toast";
import { isValidEmail, isValidPhoneNumber } from "@/lib/utils/validation";

type StoreFormMode = "create" | "edit";

export type StoreFormProps = {
  locale: Locale;
  platform: PlatformConfig;
  selectedBot: Bot;
  mode: StoreFormMode;
  /** Bắt buộc khi `mode === "edit"` */
  initialStore?: Store;
};

export function StoreForm({ locale, platform, selectedBot, mode, initialStore }: StoreFormProps) {
  const router = useRouter();
  const t = getMessages(locale);
  const listHref = `/${locale}/store`;

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<StoreFormField, string>>>({});

  const [name, setName] = useState("");
  const [primaryImageUrl, setPrimaryImageUrl] = useState("");
  const [slideImageUrls, setSlideImageUrls] = useState<string[]>([]);
  const [uploadingPrimaryImage, setUploadingPrimaryImage] = useState(false);
  const [uploadingSlideImages, setUploadingSlideImages] = useState(false);
  const [uploadingSlideImageCount, setUploadingSlideImageCount] = useState(0);
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

  const createDefaultsApplied = useRef(false);

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
    if (mode !== "create" || regionsLoading || createDefaultsApplied.current) return;
    const list =
      regions.length > 0
        ? regions
        : [{ region_code: "VN", default_timezone: "Asia/Ho_Chi_Minh", default_currency: "VND" }];
    const row = list.find((r) => r.region_code === "VN") ?? list[0];
    if (row) {
      setRegionCode(row.region_code);
      setTimezone(row.default_timezone);
      setCurrencyCode(row.default_currency);
    }
    createDefaultsApplied.current = true;
  }, [mode, regionsLoading, regions]);

  useEffect(() => {
    if (mode !== "edit" || !initialStore) return;
    setName(initialStore.name);
    setPrimaryImageUrl(initialStore.primaryImageUrl || "");
    setSlideImageUrls(initialStore.slideImageUrls || []);
    setRegionCode(initialStore.regionCode);
    setTimezone(initialStore.timezone);
    setCurrencyCode(initialStore.currencyCode);
    setAddress(initialStore.address || "");
    setPhone(initialStore.phoneNumber || "");
    setEmail(initialStore.email || "");
    setDescription(initialStore.description || "");
    setYoutubeUrl(initialStore.youtubeUrl || "");
    setFacebookUrl(initialStore.facebookUrl || "");
    setGoogleMapUrl(initialStore.googleMapUrl || "");
    setWebsiteUrl(initialStore.websiteUrl || "");
    setFormError(null);
    setFieldErrors({});
  }, [mode, initialStore]);

  function applyRegionDefaults(code: string, list: RegionApiItem[]) {
    const row = list.find((x) => x.region_code === code);
    if (row) {
      setTimezone(row.default_timezone);
      setCurrencyCode(row.default_currency);
    }
  }

  async function uploadPrimaryImage(file: File) {
    setUploadingPrimaryImage(true);
    try {
      const auth = await createMediaUploadAuth(selectedBot.id, { scope: "store_primary" });
      const uploaded = await uploadImageToImageKit(auth, file);
      setPrimaryImageUrl(uploaded.url);
      notifySuccess(t.toast.imageUploadSuccess);
    } catch {
      notifyError(t.toast.imageUploadFailed);
    } finally {
      setUploadingPrimaryImage(false);
    }
  }

  async function uploadSlideImages(files: FileList) {
    const nextFiles = Array.from(files);
    if (nextFiles.length === 0) {
      return;
    }

    const remaining = Math.max(0, 10 - slideImageUrls.length);
    if (remaining === 0) {
      notifyError(t.store.validation.slideImageLimit);
      return;
    }

    setUploadingSlideImages(true);
    setUploadingSlideImageCount(Math.min(nextFiles.length, remaining));
    let uploadedCount = 0;
    try {
      const uploadQueue = nextFiles.slice(0, remaining);
      const uploadedUrls: string[] = [];
      for (const file of uploadQueue) {
        const auth = await createMediaUploadAuth(selectedBot.id, { scope: "store_slide" });
        const uploaded = await uploadImageToImageKit(auth, file);
        uploadedUrls.push(uploaded.url);
      }
      uploadedCount = uploadedUrls.length;
      if (uploadedUrls.length > 0) {
        setSlideImageUrls((prev) => [...prev, ...uploadedUrls]);
      }
      if (nextFiles.length > remaining) {
        notifyError(t.store.validation.slideImageLimit);
      } else if (uploadedCount > 0) {
        notifySuccess(t.toast.imageUploadSuccess);
      }
    } catch {
      notifyError(t.toast.imageUploadFailed);
    } finally {
      setUploadingSlideImages(false);
      setUploadingSlideImageCount(0);
    }
  }

  function removeSlideImage(index: number) {
    setSlideImageUrls((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  }

  async function handleSubmit(e: FormEvent) {
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

    if (mode === "edit" && !initialStore) return;

    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    const payload = {
      name: name.trim(),
      primary_image_url: primaryImageUrl.trim() || null,
      slide_image_urls: slideImageUrls.map((url) => url.trim()).filter((url) => url.length > 0),
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
      if (mode === "edit" && initialStore) {
        await updateStore(selectedBot.id, initialStore.id, payload);
        notifySuccess(t.toast.storeUpdated);
      } else {
        await createStore(selectedBot.id, payload);
        notifySuccess(t.toast.storeCreated);
      }
      router.push(listHref);
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

  const fieldBorderClass = (field: StoreFormField) =>
    fieldErrors[field]
      ? "border-red-500 focus:border-red-500"
      : "border-slate-300 focus:border-slate-500";

  const title = mode === "create" ? t.store.addStore : t.store.editStore;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={listHref}
          className="dm-back-link"
        >
          <span aria-hidden>←</span>
          {t.store.backToStoreList}
        </Link>
        <h2 className="dm-text-heading mt-3">{title}</h2>
      </div>

      {formError ? (
        <div className="dm-form-error-banner">{formError}</div>
      ) : null}

      <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-4">
        <div>
          <label className="dm-label mb-1 block">{t.store.name} *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`dm-input ${fieldBorderClass("name")}`}
            required
          />
          {fieldErrors.name ? <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p> : null}
        </div>

        <div className="dm-well space-y-4">
          <p className="text-sm font-semibold text-(--dm-text)">{t.store.imageSectionTitle}</p>

          <div>
            <label className="dm-label mb-1 block">{t.store.primaryImage}</label>
            {fieldErrors.primaryImageUrl ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.primaryImageUrl}</p>
            ) : null}
            {uploadingPrimaryImage ? (
              <div className="mt-3 overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-2">
                <Skeleton className="h-40 w-full rounded" />
              </div>
            ) : null}
            {primaryImageUrl ? (
              <div className="mt-3 overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-2">
                <img
                  src={primaryImageUrl}
                  alt={t.store.primaryImage}
                  className="h-40 w-full rounded object-cover"
                />
              </div>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label className="dm-btn-ghost cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingPrimaryImage}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      void uploadPrimaryImage(file);
                    }
                    e.currentTarget.value = "";
                  }}
                />
                {uploadingPrimaryImage ? t.store.uploadingImage : t.store.uploadPrimaryImage}
              </label>
              {primaryImageUrl ? (
                <button type="button" className="dm-btn-ghost" onClick={() => setPrimaryImageUrl("")}>
                  {t.store.removeImage}
                </button>
              ) : null}
            </div>
          </div>

          <div>
            <label className="dm-label mb-1 block">{t.store.slideImages}</label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {slideImageUrls.length === 0 ? (
                <p className="text-xs text-(--dm-text-muted)">{t.store.noSlideImages}</p>
              ) : (
                slideImageUrls.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-2"
                  >
                    <img
                      src={url}
                      alt={`${t.store.slideImages} ${index + 1}`}
                      className="h-28 w-full rounded object-cover"
                    />
                    <button
                      type="button"
                      className="mt-2 text-xs text-red-600 hover:text-red-700"
                      onClick={() => removeSlideImage(index)}
                    >
                      {t.store.removeImage}
                    </button>
                  </div>
                ))
              )}
              {uploadingSlideImageCount > 0
                ? Array.from({ length: uploadingSlideImageCount }, (_, index) => (
                    <div
                      key={`slide-uploading-${index}`}
                      className="overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-2"
                    >
                      <Skeleton className="h-28 w-full rounded" />
                      <Skeleton className="mt-2 h-4 w-16" />
                    </div>
                  ))
                : null}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label className="dm-btn-ghost cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploadingSlideImages}
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      void uploadSlideImages(files);
                    }
                    e.currentTarget.value = "";
                  }}
                />
                {uploadingSlideImages ? t.store.uploadingImage : t.store.uploadSlideImages}
              </label>
              <p className="text-xs text-(--dm-text-muted)">
                {t.store.validation.slideImageLimitHint}
              </p>
            </div>
            {fieldErrors.slideImageUrls ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.slideImageUrls}</p>
            ) : null}
          </div>
        </div>

        <div className="dm-well">
          <p className="mb-3 text-sm font-semibold text-(--dm-text)">{t.store.bookingLocaleTitle}</p>
          <label className="dm-label mb-1 block">{t.store.region}</label>
          <select
            value={regionCode}
            disabled={regionsLoading}
            onChange={(e) => {
              const v = e.target.value;
              setRegionCode(v);
              applyRegionDefaults(v, regions.length > 0 ? regions : []);
            }}
            className={`dm-input disabled:cursor-not-allowed disabled:opacity-70 ${fieldBorderClass("regionCode")}`}
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
          <p className="mt-1 text-xs text-(--dm-text-muted)">{t.store.regionHint}</p>
          {regionsLoading ? (
            <div className="mt-2 space-y-2" aria-busy="true" aria-label={t.store.loadingRegions} role="status">
              <Skeleton className="h-3 w-44" />
              <Skeleton className="h-3 w-32" />
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="dm-label mb-1 block">{t.store.timezone}</label>
              <input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                maxLength={64}
                className={`dm-input font-mono ${fieldBorderClass("timezone")}`}
              />
              {fieldErrors.timezone ? (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.timezone}</p>
              ) : null}
            </div>
            <div>
              <label className="dm-label mb-1 block">{t.store.currency}</label>
              <input
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value.toUpperCase().slice(0, 3))}
                maxLength={3}
                className={`dm-input font-mono ${fieldBorderClass("currencyCode")}`}
              />
              {fieldErrors.currencyCode ? (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.currencyCode}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div>
          <label className="dm-label mb-1 block">{t.store.address}</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={`dm-input ${fieldBorderClass("address")}`}
          />
          {fieldErrors.address ? <p className="mt-1 text-xs text-red-600">{fieldErrors.address}</p> : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="dm-label mb-1 block">{t.store.phone}</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`dm-input ${fieldBorderClass("phone")}`}
            />
            {fieldErrors.phone ? <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p> : null}
          </div>
          <div>
            <label className="dm-label mb-1 block">{t.store.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`dm-input ${fieldBorderClass("email")}`}
            />
            {fieldErrors.email ? <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p> : null}
          </div>
        </div>

        <div>
          <label className="dm-label mb-1 block">{t.store.description}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="..."
            rows={2}
            className={`dm-input ${fieldBorderClass("description")}`}
          />
          {fieldErrors.description ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.description}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="dm-label mb-1 block">{t.store.youtubeUrl}</label>
            <input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className={`dm-input ${fieldBorderClass("youtubeUrl")}`}
            />
            {fieldErrors.youtubeUrl ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.youtubeUrl}</p>
            ) : null}
          </div>
          <div>
            <label className="dm-label mb-1 block">{t.store.facebookUrl}</label>
            <input
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              className={`dm-input ${fieldBorderClass("facebookUrl")}`}
            />
            {fieldErrors.facebookUrl ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.facebookUrl}</p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="dm-label mb-1 block">{t.store.googleMapUrl}</label>
            <input
              value={googleMapUrl}
              onChange={(e) => setGoogleMapUrl(e.target.value)}
              className={`dm-input ${fieldBorderClass("googleMapUrl")}`}
            />
            {fieldErrors.googleMapUrl ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.googleMapUrl}</p>
            ) : null}
          </div>
          <div>
            <label className="dm-label mb-1 block">{t.store.websiteUrl}</label>
            <input
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className={`dm-input ${fieldBorderClass("websiteUrl")}`}
            />
            {fieldErrors.websiteUrl ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.websiteUrl}</p>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href={listHref}
            className="dm-btn-ghost"
          >
            {t.store.cancel}
          </Link>
          <button
            type="submit"
            disabled={submitting || uploadingPrimaryImage || uploadingSlideImages}
            className={`rounded-lg px-6 py-2 text-sm font-medium disabled:opacity-50 ${platform.accentClassName} ${platform.hoverClassName}`}
          >
            {submitting ? t.auth.common.submitting : t.store.save}
          </button>
        </div>
      </form>
    </div>
  );
}
