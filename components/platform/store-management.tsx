"use client";

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
  createStore,
  updateStore,
  deleteStore,
} from "@/lib/api/store/client";
import { ApiClientError } from "@/lib/api/error";
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
        setError("Failed to load stores");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadStores();
    return () => {
      mounted = false;
    };
  }, [selectedBot.id]);

  function openAddModal() {
    setEditingStoreId(null);
    setName("");
    setAddress("");
    setPhone("");
    setEmail("");
    setDescription("");
    setYoutubeUrl("");
    setFacebookUrl("");
    setGoogleMapUrl("");
    setWebsiteUrl("");
    setFormError(null);
    setShowModal(true);
  }

  function openEditModal(store: Store) {
    setEditingStoreId(store.id);
    setName(store.name);
    setAddress(store.address || "");
    setPhone(store.phoneNumber || "");
    setEmail(store.email || "");
    setDescription(store.description || "");
    setYoutubeUrl(store.youtubeUrl || "");
    setFacebookUrl(store.facebookUrl || "");
    setGoogleMapUrl(store.googleMapUrl || "");
    setWebsiteUrl(store.websiteUrl || "");
    setFormError(null);
    setShowModal(true);
  }

  async function handleDelete(id: string) {
    if (!confirm(t.store.deleteConfirm)) return;
    try {
      await deleteStore(selectedBot.id, id);
      setStores((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Failed to delete store");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const normalizedPhone = phone.trim();
    const normalizedEmail = email.trim();

    if (normalizedPhone.length > 50) {
      setFormError(t.store.validation.phoneTooLong);
      return;
    }
    if (normalizedPhone && !isValidPhoneNumber(normalizedPhone)) {
      setFormError(t.store.validation.phoneInvalid);
      return;
    }
    if (normalizedEmail.length > 255) {
      setFormError(t.store.validation.emailTooLong);
      return;
    }
    if (normalizedEmail && !isValidEmail(normalizedEmail)) {
      setFormError(t.store.validation.emailInvalid);
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload = {
      name: name.trim(),
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
      } else {
        setStores((prev) => [...prev, savedStore]);
      }
      setShowModal(false);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFormError(err.message);
      } else {
        setFormError("An unexpected error occurred");
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

  return (
    <div className="space-y-4">
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
          <div className="p-8 text-center text-sm text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium">{t.store.name}</th>
                <th className="px-4 py-3 font-medium">{t.store.address}</th>
                <th className="px-4 py-3 font-medium">{t.store.phone}</th>
                <th className="px-4 py-3 font-medium">{t.store.status}</th>
                <th className="px-4 py-3 font-medium text-right">{t.store.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {stores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Chưa có dữ liệu
                  </td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{store.name}</td>
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
                      <button
                        onClick={() => openEditModal(store)}
                        className="mr-3 text-slate-400 hover:text-slate-700"
                        title={t.store.editStore}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(store.id)}
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
        )}
      </div>

      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl relative animate-in zoom-in-95 duration-200"
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
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {t.store.address}
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    {t.store.phone}
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    {t.store.email}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
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
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    {t.store.youtubeUrl}
                  </label>
                  <input
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    {t.store.facebookUrl}
                  </label>
                  <input
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
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
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    {t.store.websiteUrl}
                  </label>
                  <input
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
