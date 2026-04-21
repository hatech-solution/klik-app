"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useStoreSettingsGate } from "@/components/platform/store-settings-context";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion, StoreStaffFormSkeleton } from "@/components/ui/screen-loading-skeletons";
import { createMediaUploadAuth, uploadImageToImageKit } from "@/lib/api/media/client";
import { createStaff, fetchStaff, updateStaff } from "@/lib/api/store/client";
import type { CreateStaffPayload, StaffApiItem } from "@/lib/api/store/types";
import { ApiClientError, getErrorMessageByKey } from "@/lib/api/error";
import { getMessages, type Locale } from "@/lib/i18n";
import { notifyApiFailure, notifyError, notifySuccess } from "@/lib/toast";

type Props = {
  locale: Locale;
  mode: "create" | "edit";
  staffId?: string;
};

export function StoreStaffFormClient({ locale, mode, staffId }: Props) {
  const router = useRouter();
  const gate = useStoreSettingsGate();
  const t = getMessages(locale);
  const st = t.store.staff;
  const errorByKey = t.store.errorByKey as Record<string, string>;

  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [price, setPrice] = useState("");
  const [maxBookings, setMaxBookings] = useState("");
  const [primaryImage, setPrimaryImage] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [uploadingPrimaryImage, setUploadingPrimaryImage] = useState(false);
  const [uploadingGalleryImages, setUploadingGalleryImages] = useState(false);
  const [uploadingGalleryImageCount, setUploadingGalleryImageCount] = useState(0);
  const [sortOrder, setSortOrder] = useState("0");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!gate || mode !== "edit" || !staffId) return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const row = await fetchStaff(gate.botId, gate.storeId, staffId);
        if (cancelled) return;
        applyRow(row);
      } catch (err) {
        if (!cancelled) {
          notifyApiFailure(err, st.loadFailed, errorByKey);
          setBanner(st.loadFailed);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [gate, mode, staffId, st.loadFailed, errorByKey]);

  function applyRow(row: StaffApiItem) {
    setName(row.name);
    setDescription(row.description);
    setAddress(row.address ?? "");
    setPhone(row.phone ?? "");
    setEmail(row.email ?? "");
    setPrice(row.price != null ? String(row.price) : "");
    setMaxBookings(row.max_bookings_per_slot != null ? String(row.max_bookings_per_slot) : "");
    setPrimaryImage(row.primary_image ?? "");
    setGalleryImages(row.gallery_images ?? []);
    setSortOrder(String(row.sort_order));
    setIsVisible(row.is_visible);
  }

  async function uploadPrimaryImageFile(file: File) {
    if (!gate) return;
    setUploadingPrimaryImage(true);
    try {
      const auth = await createMediaUploadAuth(gate.botId, { scope: "staff_primary" });
      const uploaded = await uploadImageToImageKit(auth, file);
      setPrimaryImage(uploaded.url);
      notifySuccess(t.toast.imageUploadSuccess);
    } catch {
      notifyError(t.toast.imageUploadFailed);
    } finally {
      setUploadingPrimaryImage(false);
    }
  }

  async function uploadGalleryFiles(files: FileList) {
    if (!gate) return;
    const nextFiles = Array.from(files);
    if (nextFiles.length === 0) return;

    const remaining = Math.max(0, 10 - galleryImages.length);
    if (remaining === 0) {
      setBanner(st.galleryLimitHint);
      return;
    }

    setUploadingGalleryImages(true);
    setUploadingGalleryImageCount(Math.min(nextFiles.length, remaining));
    try {
      const uploadQueue = nextFiles.slice(0, remaining);
      const uploadedUrls: string[] = [];
      for (const file of uploadQueue) {
        const auth = await createMediaUploadAuth(gate.botId, { scope: "staff_gallery" });
        const uploaded = await uploadImageToImageKit(auth, file);
        uploadedUrls.push(uploaded.url);
      }
      if (uploadedUrls.length > 0) {
        setGalleryImages((prev) => [...prev, ...uploadedUrls]);
        notifySuccess(t.toast.imageUploadSuccess);
      }
      if (nextFiles.length > remaining) {
        setBanner(st.galleryLimitHint);
      }
    } catch {
      notifyError(t.toast.imageUploadFailed);
    } finally {
      setUploadingGalleryImages(false);
      setUploadingGalleryImageCount(0);
    }
  }

  function removeGalleryImage(index: number) {
    setGalleryImages((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  }

  function buildPayload(): CreateStaffPayload {
    const sort = Number.parseInt(sortOrder, 10);
    const payload: CreateStaffPayload = {
      name: name.trim(),
      description: description.trim(),
      address: address.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      primary_image: primaryImage.trim() || null,
      gallery_images: galleryImages,
      sort_order: Number.isFinite(sort) ? sort : 0,
      is_visible: isVisible,
    };
    const p = price.trim();
    if (p !== "") {
      const n = Number(p);
      if (Number.isFinite(n)) {
        payload.price = n;
      }
    }
    const mb = maxBookings.trim();
    if (mb !== "") {
      const n = Number.parseInt(mb, 10);
      if (Number.isFinite(n) && n > 0) {
        payload.max_bookings_per_slot = n;
      }
    }
    return payload;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gate) return;
    setSaving(true);
    setBanner(null);
    const payload = buildPayload();
    try {
      if (mode === "create") {
        await createStaff(gate.botId, gate.storeId, payload);
        notifySuccess(st.formSaved);
        router.replace(`/${locale}/stores/${gate.storeId}/settings/staff`);
      } else if (staffId) {
        await updateStaff(gate.botId, gate.storeId, staffId, payload);
        notifySuccess(st.formSaved);
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setBanner(
          getErrorMessageByKey(
            err,
            mode === "create" ? st.formCreateFailed : st.formSaveFailed,
            errorByKey,
          ),
        );
      } else {
        setBanner(mode === "create" ? st.formCreateFailed : st.formSaveFailed);
      }
    } finally {
      setSaving(false);
    }
  }

  if (!gate) {
    return null;
  }

  const listHref = `/${locale}/stores/${gate.storeId}/settings/staff`;

  if (loading) {
    return (
      <LoadingRegion aria-label={st.loading}>
        <StoreStaffFormSkeleton />
      </LoadingRegion>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-(--dm-text)">
          {mode === "create" ? st.formCreateTitle : st.formEditTitle}
        </h2>
        <Link href={listHref} className="dm-link-accent text-sm underline">
          {st.backToList}
        </Link>
      </div>

      {banner ? <div className="dm-form-error-banner">{banner}</div> : null}

      <form onSubmit={(e) => void handleSubmit(e)} className="dm-overview-panel space-y-4">
        <div>
          <label className="dm-label mb-1 block text-xs">{st.formName} *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="dm-input"
          />
        </div>
        <div>
          <label className="dm-label mb-1 block text-xs">{st.formDescription} *</label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="dm-input min-h-20 resize-y"
          />
        </div>
        <div>
          <label className="dm-label mb-1 block text-xs">{st.formAddress}</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} className="dm-input" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="dm-label mb-1 block text-xs">{st.formPhone}</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="dm-input" />
          </div>
          <div>
            <label className="dm-label mb-1 block text-xs">{st.formEmail}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="dm-input" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="dm-label mb-1 block text-xs">{st.formPrice}</label>
            <input type="text" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} className="dm-input" />
          </div>
          <div>
            <label className="dm-label mb-1 block text-xs">{st.formMaxBookings}</label>
            <input type="number" min={1} value={maxBookings} onChange={(e) => setMaxBookings(e.target.value)} className="dm-input" />
          </div>
        </div>
        <div>
          <label className="dm-label mb-1 block text-xs">{st.formPrimaryImage}</label>
          {uploadingPrimaryImage ? (
            <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
              <Skeleton className="h-28 w-28 rounded-full" />
            </div>
          ) : primaryImage ? (
            <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
              <img src={primaryImage} alt={st.formPrimaryImage} className="h-28 w-28 rounded-full object-cover" />
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
                    void uploadPrimaryImageFile(file);
                  }
                  e.currentTarget.value = "";
                }}
              />
              {uploadingPrimaryImage ? st.uploadingImage : st.uploadPrimaryImage}
            </label>
            {primaryImage ? (
              <button type="button" className="dm-btn-ghost" onClick={() => setPrimaryImage("")}>
                {st.removeImage}
              </button>
            ) : null}
          </div>
        </div>
        <div>
          <label className="dm-label mb-1 block text-xs">{st.formGallery}</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {galleryImages.length === 0 ? (
              <p className="text-xs text-(--dm-text-muted)">{st.noGalleryImages}</p>
            ) : (
              galleryImages.map((url, index) => (
                <div key={`${url}-${index}`} className="overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-2">
                  <img src={url} alt={`${st.formGallery} ${index + 1}`} className="h-28 w-full rounded object-cover" />
                  <button
                    type="button"
                    className="mt-2 text-xs text-red-600 hover:text-red-700"
                    onClick={() => removeGalleryImage(index)}
                  >
                    {st.removeImage}
                  </button>
                </div>
              ))
            )}
            {uploadingGalleryImageCount > 0
              ? Array.from({ length: uploadingGalleryImageCount }, (_, index) => (
                  <div
                    key={`staff-gallery-uploading-${index}`}
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
                disabled={uploadingGalleryImages}
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    void uploadGalleryFiles(files);
                  }
                  e.currentTarget.value = "";
                }}
              />
              {uploadingGalleryImages ? st.uploadingImage : st.uploadGalleryImages}
            </label>
            <p className="text-xs text-(--dm-text-muted)">{st.galleryLimitHint}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="dm-label mb-1 block text-xs">{st.formSortOrder}</label>
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="dm-input" />
          </div>
          <label className="flex items-center gap-2 pt-6 text-sm text-(--dm-text-secondary)">
            <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} className="rounded border-(--dm-border)" />
            {st.formVisible}
          </label>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || uploadingPrimaryImage || uploadingGalleryImages}
            className={`rounded-lg px-5 py-2 text-sm font-medium text-white disabled:opacity-50 ${gate.platform.accentClassName} ${gate.platform.hoverClassName}`}
          >
            {saving ? "…" : mode === "create" ? st.formSubmitCreate : st.formSubmitSave}
          </button>
          <Link href={listHref} className="dm-btn-ghost inline-flex items-center justify-center rounded-lg">
            {st.formCancel}
          </Link>
        </div>
      </form>
    </div>
  );
}
