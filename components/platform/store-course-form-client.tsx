"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useStoreSettingsGate } from "@/components/platform/store-settings-context";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion, StoreCourseFormSkeleton } from "@/components/ui/screen-loading-skeletons";
import { createMediaUploadAuth, uploadImageToImageKit } from "@/lib/api/media/client";
import { createCourse, fetchCourse, updateCourse } from "@/lib/api/store/client";
import type { CourseApiItem, CreateCoursePayload } from "@/lib/api/store/types";
import { ApiClientError, getErrorMessageByKey } from "@/lib/api/error";
import { getMessages, type Locale } from "@/lib/i18n";
import { notifyApiFailure, notifyError, notifySuccess } from "@/lib/toast";

type Props = {
  locale: Locale;
  mode: "create" | "edit";
  courseId?: string;
};

function splitDuration(total: number): { hours: string; minutes: string } {
  const safe = Number.isFinite(total) && total > 0 ? Math.floor(total) : 60;
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  return { hours: String(hours), minutes: String(minutes) };
}

function buildDurationMinutes(
  hoursText: string,
  minutesText: string,
  invalidMessage: string,
): { value?: number; error?: string } {
  const h = Number.parseInt(hoursText.trim(), 10);
  const m = Number.parseInt(minutesText.trim(), 10);
  if (!Number.isFinite(h) || h < 0) {
    return { error: invalidMessage };
  }
  if (!Number.isFinite(m) || m < 0 || m > 55 || m % 5 !== 0) {
    return { error: invalidMessage };
  }
  const total = h * 60 + m;
  if (total <= 0) {
    return { error: invalidMessage };
  }
  return { value: total };
}

export function StoreCourseFormClient({ locale, mode, courseId }: Props) {
  const router = useRouter();
  const gate = useStoreSettingsGate();
  const t = getMessages(locale);
  const c = t.store.course;
  const errorByKey = t.store.errorByKey as Record<string, string>;

  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationHours, setDurationHours] = useState("1");
  const [durationMinutes, setDurationMinutes] = useState("0");
  const [price, setPrice] = useState("");
  const [primaryImage, setPrimaryImage] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [uploadingPrimaryImage, setUploadingPrimaryImage] = useState(false);
  const [uploadingGalleryImages, setUploadingGalleryImages] = useState(false);
  const [uploadingGalleryImageCount, setUploadingGalleryImageCount] = useState(0);
  const [sortOrder, setSortOrder] = useState("0");

  useEffect(() => {
    if (!gate || mode !== "edit" || !courseId) return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const row = await fetchCourse(gate.botId, gate.storeId, courseId);
        if (cancelled) return;
        applyRow(row);
      } catch (err) {
        if (!cancelled) {
          notifyApiFailure(err, c.loadFailed, errorByKey);
          setBanner(c.loadFailed);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [gate, mode, courseId, c.loadFailed, errorByKey]);

  function applyRow(row: CourseApiItem) {
    setName(row.name);
    setDescription(row.description);
    const split = splitDuration(row.duration_estimate_minutes);
    setDurationHours(split.hours);
    setDurationMinutes(split.minutes);
    setPrice(row.price != null ? String(row.price) : "");
    setPrimaryImage(row.primary_image ?? "");
    setGalleryImages(row.gallery_images ?? []);
    setSortOrder(String(row.sort_order));
  }

  async function uploadPrimaryImageFile(file: File) {
    if (!gate) return;
    setUploadingPrimaryImage(true);
    try {
      const auth = await createMediaUploadAuth(gate.botId, { scope: "course_primary" });
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
      setBanner(c.galleryLimitHint);
      return;
    }

    setUploadingGalleryImages(true);
    setUploadingGalleryImageCount(Math.min(nextFiles.length, remaining));
    try {
      const uploadQueue = nextFiles.slice(0, remaining);
      const uploadedUrls: string[] = [];
      for (const file of uploadQueue) {
        const auth = await createMediaUploadAuth(gate.botId, { scope: "course_gallery" });
        const uploaded = await uploadImageToImageKit(auth, file);
        uploadedUrls.push(uploaded.url);
      }
      if (uploadedUrls.length > 0) {
        setGalleryImages((prev) => [...prev, ...uploadedUrls]);
        notifySuccess(t.toast.imageUploadSuccess);
      }
      if (nextFiles.length > remaining) {
        setBanner(c.galleryLimitHint);
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

  const durationPreview = useMemo(() => {
    const d = buildDurationMinutes(durationHours, durationMinutes, c.formDurationHint);
    return d.value != null ? d.value : null;
  }, [durationHours, durationMinutes, c.formDurationHint]);

  function buildPayload(): { payload?: CreateCoursePayload; error?: string } {
    const duration = buildDurationMinutes(durationHours, durationMinutes, c.formDurationHint);
    if (!duration.value) {
      return { error: duration.error ?? c.formDurationHint };
    }

    const sort = Number.parseInt(sortOrder, 10);
    const payload: CreateCoursePayload = {
      name: name.trim(),
      description: description.trim(),
      duration_estimate_minutes: duration.value,
      primary_image: primaryImage.trim() || null,
      gallery_images: galleryImages,
      sort_order: Number.isFinite(sort) ? sort : 0,
    };

    const p = price.trim();
    if (p !== "") {
      const n = Number(p);
      if (Number.isFinite(n)) {
        payload.price = n;
      }
    }

    return { payload };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gate) return;
    setSaving(true);
    setBanner(null);
    const built = buildPayload();
    if (!built.payload) {
      setBanner(built.error ?? c.formDurationHint);
      setSaving(false);
      return;
    }

    try {
      if (mode === "create") {
        await createCourse(gate.botId, gate.storeId, built.payload);
        notifySuccess(t.toast.courseCreated);
        router.replace(`/${locale}/stores/${gate.storeId}/settings/courses`);
      } else if (courseId) {
        await updateCourse(gate.botId, gate.storeId, courseId, built.payload);
        notifySuccess(t.toast.courseUpdated);
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setBanner(
          getErrorMessageByKey(
            err,
            mode === "create" ? c.formCreateFailed : c.formSaveFailed,
            errorByKey,
          ),
        );
      } else {
        setBanner(mode === "create" ? c.formCreateFailed : c.formSaveFailed);
      }
    } finally {
      setSaving(false);
    }
  }

  if (!gate) {
    return null;
  }

  const listHref = `/${locale}/stores/${gate.storeId}/settings/courses`;

  if (loading) {
    return (
      <LoadingRegion aria-label={c.loading}>
        <StoreCourseFormSkeleton />
      </LoadingRegion>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-(--dm-text)">
          {mode === "create" ? c.formCreateTitle : c.formEditTitle}
        </h2>
        <Link href={listHref} className="dm-link-accent text-sm underline">
          {c.backToList}
        </Link>
      </div>

      {banner ? <div className="dm-form-error-banner">{banner}</div> : null}

      <form onSubmit={(e) => void handleSubmit(e)} className="dm-overview-panel space-y-4">
        <div>
          <label className="dm-label mb-1 block text-xs">{c.formName} *</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="dm-input" />
        </div>
        <div>
          <label className="dm-label mb-1 block text-xs">{c.formDescription} *</label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="dm-input min-h-20 resize-y"
          />
        </div>
        <div>
          <label className="dm-label mb-1 block text-xs">{c.formDuration} *</label>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="number"
              min={0}
              step={1}
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              className="dm-input"
              placeholder={c.formDurationHours}
            />
            <input
              type="number"
              min={0}
              max={55}
              step={5}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="dm-input"
              placeholder={c.formDurationMinutes}
            />
          </div>
          <p className="mt-1 text-xs text-(--dm-text-muted)">
            {c.formDurationHint}
            {durationPreview != null ? ` (${durationPreview} phút)` : ""}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="dm-label mb-1 block text-xs">{c.formPrice}</label>
            <input
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="dm-input"
            />
          </div>
          <div>
            <label className="dm-label mb-1 block text-xs">{c.formSortOrder}</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="dm-input"
            />
          </div>
        </div>
        <div>
          <label className="dm-label mb-1 block text-xs">{c.formPrimaryImage}</label>
          {uploadingPrimaryImage ? (
            <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-2">
              <Skeleton className="h-40 w-full rounded" />
            </div>
          ) : primaryImage ? (
            <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-2">
              <img src={primaryImage} alt={c.formPrimaryImage} className="h-40 w-full rounded object-cover" />
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
              {uploadingPrimaryImage ? c.uploadingImage : c.uploadPrimaryImage}
            </label>
            {primaryImage ? (
              <button type="button" className="dm-btn-ghost" onClick={() => setPrimaryImage("")}>
                {c.removeImage}
              </button>
            ) : null}
          </div>
        </div>
        <div>
          <label className="dm-label mb-1 block text-xs">{c.formGallery}</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {galleryImages.length === 0 ? (
              <p className="text-xs text-(--dm-text-muted)">{c.noGalleryImages}</p>
            ) : (
              galleryImages.map((url, index) => (
                <div key={`${url}-${index}`} className="overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-2">
                  <img src={url} alt={`${c.formGallery} ${index + 1}`} className="h-28 w-full rounded object-cover" />
                  <button
                    type="button"
                    className="mt-2 text-xs text-red-600 hover:text-red-700"
                    onClick={() => removeGalleryImage(index)}
                  >
                    {c.removeImage}
                  </button>
                </div>
              ))
            )}
            {uploadingGalleryImageCount > 0
              ? Array.from({ length: uploadingGalleryImageCount }, (_, index) => (
                  <div
                    key={`course-gallery-uploading-${index}`}
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
              {uploadingGalleryImages ? c.uploadingImage : c.uploadGalleryImages}
            </label>
            <p className="text-xs text-(--dm-text-muted)">{c.galleryLimitHint}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || uploadingPrimaryImage || uploadingGalleryImages}
            className={`rounded-lg px-5 py-2 text-sm font-medium text-white disabled:opacity-50 ${gate.platform.accentClassName} ${gate.platform.hoverClassName}`}
          >
            {saving ? "…" : mode === "create" ? c.formSubmitCreate : c.formSubmitSave}
          </button>
          <Link href={listHref} className="dm-btn-ghost inline-flex items-center justify-center rounded-lg">
            {c.formCancel}
          </Link>
        </div>
      </form>
    </div>
  );
}
