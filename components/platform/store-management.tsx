"use client";

import { useState } from "react";
import { Locale, getMessages } from "@/lib/i18n";
import { Store, INITIAL_STORES, Bot } from "@/lib/mock-data";
import { PlatformConfig } from "@/lib/platforms";

type StoreManagementProps = {
  locale: Locale;
  platform: PlatformConfig;
  selectedBot: Bot;
};

export function StoreManagement({ locale, platform, selectedBot }: StoreManagementProps) {
  const t = getMessages(locale);
  const [stores, setStores] = useState<Store[]>(
    INITIAL_STORES[selectedBot.id] || []
  );
  
  const [showModal, setShowModal] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  function openAddModal() {
    setEditingStoreId(null);
    setName("");
    setAddress("");
    setPhone("");
    setStatus("active");
    setShowModal(true);
  }

  function openEditModal(store: Store) {
    setEditingStoreId(store.id);
    setName(store.name);
    setAddress(store.address);
    setPhone(store.phoneNumber);
    setStatus(store.status);
    setShowModal(true);
  }

  function handleDelete(id: string) {
    if (confirm(t.store.deleteConfirm)) {
      setStores((prev) => prev.filter((s) => s.id !== id));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingStoreId) {
      setStores((prev) =>
        prev.map((s) =>
          s.id === editingStoreId
            ? { ...s, name, address, phoneNumber: phone, status }
            : s
        )
      );
    } else {
      const newStore: Store = {
        id: `store-${Math.floor(Math.random() * 10000)}`,
        name,
        address,
        phoneNumber: phone,
        status,
      };
      setStores((prev) => [...prev, newStore]);
    }
    setShowModal(false);
  }

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
                  <td className="px-4 py-3">{store.address}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{store.phoneNumber}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        store.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {store.status === "active" ? t.store.active : t.store.inactive}
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
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {t.store.name}
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
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {t.store.phone}
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {t.store.status}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                >
                  <option value="active">{t.store.active}</option>
                  <option value="inactive">{t.store.inactive}</option>
                </select>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {t.store.cancel}
                </button>
                <button
                  type="submit"
                  className={`rounded-lg px-6 py-2 text-sm font-medium ${platform.accentClassName} ${platform.hoverClassName}`}
                >
                  {t.store.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
