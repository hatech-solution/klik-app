"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useStoreSettingsGate } from "@/components/platform/store-settings-context";
import { LoadingRegion, StoreSettingsGateBodySkeleton } from "@/components/ui/screen-loading-skeletons";
import { createStaff, fetchStaff, updateStaff } from "@/lib/api/store/client";
import type { CreateStaffPayload, StaffApiItem } from "@/lib/api/store/types";
import { ApiClientError, getErrorMessageByKey } from "@/lib/api/error";
import { getMessages, type Locale } from "@/lib/i18n";
import { notifyApiFailure, notifySuccess } from "@/lib/toast";

type Props = {
  locale: Locale;
  mode: "create" | "edit";
  staffId?: string;
};

function parseGallery(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);
}

export function StoreStaffFormClient({ locale, mode, staffId }: Props) {
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
  const [galleryText, setGalleryText] = useState("");
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
    setGalleryText((row.gallery_images ?? []).join("\n"));
    setSortOrder(String(row.sort_order));
    setIsVisible(row.is_visible);
  }

  function buildPayload(): CreateStaffPayload {
    const gallery_images = parseGallery(galleryText);
    const sort = Number.parseInt(sortOrder, 10);
    const payload: CreateStaffPayload = {
      name: name.trim(),
      description: description.trim(),
      address: address.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      primary_image: primaryImage.trim() || null,
      gallery_images,
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
        window.location.assign(`/${locale}/dashboard/stores/${gate.storeId}/settings/staff`);
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

  const listHref = `/${locale}/dashboard/stores/${gate.storeId}/settings/staff`;

  if (loading) {
    return (
      <LoadingRegion aria-label={st.loading} className="py-6">
        <StoreSettingsGateBodySkeleton />
      </LoadingRegion>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">
          {mode === "create" ? st.formCreateTitle : st.formEditTitle}
        </h2>
        <Link href={listHref} className="text-sm font-medium text-slate-600 underline hover:text-slate-900">
          {st.backToList}
        </Link>
      </div>

      {banner ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{banner}</div> : null}

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">{st.formName} *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">{st.formDescription} *</label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">{st.formAddress}</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">{st.formPhone}</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">{st.formEmail}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">{st.formPrice}</label>
            <input type="text" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">{st.formMaxBookings}</label>
            <input type="number" min={1} value={maxBookings} onChange={(e) => setMaxBookings(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">{st.formPrimaryImage}</label>
          <input value={primaryImage} onChange={(e) => setPrimaryImage(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">{st.formGallery}</label>
          <textarea rows={4} value={galleryText} onChange={(e) => setGalleryText(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">{st.formSortOrder}</label>
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 pt-6 text-sm text-slate-800">
            <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} className="rounded border-slate-300" />
            {st.formVisible}
          </label>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className={`rounded-lg px-5 py-2 text-sm font-medium text-white disabled:opacity-50 ${gate.platform.accentClassName} ${gate.platform.hoverClassName}`}
          >
            {saving ? "…" : mode === "create" ? st.formSubmitCreate : st.formSubmitSave}
          </button>
          <Link
            href={listHref}
            className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {st.formCancel}
          </Link>
        </div>
      </form>
    </div>
  );
}
