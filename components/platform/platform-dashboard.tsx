"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getErrorMessage, isUnauthorizedError } from "@/lib/api/error";
import { notifyError, notifySuccess } from "@/lib/toast";
import {
  createBotApi,
  deactivateBotApi,
  listBotsApi,
  mapBotFromApi,
  updateBotApi,
} from "@/lib/api/bot";
import {
  DASHBOARD_SECTIONS,
  type DashboardSectionId,
} from "@/lib/constants/dashboard-sections";
import { getMessages, Locale } from "@/lib/i18n";
import { PlatformId, PLATFORM_CONFIGS } from "@/lib/platforms";
import type { Bot } from "@/lib/types/bot";
import { usePlatformStore } from "@/store/usePlatformStore";
import { StoreManagement } from "./store-management";

const SESSION_BOT_KEY = "bot_id";

const AVATAR_COLORS = [
  "bg-teal-600",
  "bg-pink-600",
  "bg-purple-600",
  "bg-emerald-600",
  "bg-sky-600",
  "bg-indigo-600",
  "bg-rose-600",
  "bg-amber-600",
];

function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

type PlatformDashboardProps = {
  locale: Locale;
};

export function PlatformDashboard({ locale }: PlatformDashboardProps) {
  const router = useRouter();
  const t = getMessages(locale);
  const { platformId } = usePlatformStore();
  
  const platform = platformId ? PLATFORM_CONFIGS[platformId as PlatformId] : undefined;

  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(SESSION_BOT_KEY) ?? "";
  });
  const [newBotName, setNewBotName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [activeSection, setActiveSection] = useState<DashboardSectionId>("store");
  const [editingBotId, setEditingBotId] = useState<string | null>(null);
  const [editingBotName, setEditingBotName] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoadingBots, setIsLoadingBots] = useState(false);
  /** Chỉ true sau khi list bot của platform hiện tại đã tải xong (tránh xóa bot_id khi bots vẫn []). */
  const [botsListReady, setBotsListReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!openMenuId) return;
    const handleClick = () => setOpenMenuId(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [openMenuId]);

  useEffect(() => {
    if (!selectedBotId) {
      localStorage.removeItem(SESSION_BOT_KEY);
      return;
    }
    localStorage.setItem(SESSION_BOT_KEY, selectedBotId);
  }, [selectedBotId]);

  useEffect(() => {
    if (!platform) {
      setBots([]);
      setBotsListReady(false);
      return;
    }

    const currentPlatform = platform;
    let cancelled = false;
    setBotsListReady(false);

    async function loadBots() {
      setIsLoadingBots(true);
      setErrorMessage(null);
      try {
        const rows = await listBotsApi(currentPlatform.id);
        if (cancelled) return;
        const mapped = rows.map(mapBotFromApi);
        setBots(mapped);
      } catch (error) {
        if (cancelled) return;
        if (isUnauthorizedError(error)) {
          router.replace(`/${locale}/login`);
          return;
        }
        const msg = getErrorMessage(error, t.auth.common.defaultError);
        setErrorMessage(msg);
        notifyError(msg);
      } finally {
        if (!cancelled) {
          setIsLoadingBots(false);
          setBotsListReady(true);
        }
      }
    }

    void loadBots();
    return () => {
      cancelled = true;
    };
  }, [platform, locale, router, t.auth.common.defaultError]);

  useEffect(() => {
    if (!botsListReady) return;
    if (!selectedBotId) return;
    if (bots.some((bot) => bot.id === selectedBotId)) return;
    setSelectedBotId("");
  }, [bots, selectedBotId, botsListReady]);

  const selectedBot = useMemo(
    () => bots.find((bot) => bot.id === selectedBotId),
    [bots, selectedBotId],
  );

  async function handleCreateBot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!platform) return;

    if (!newBotName.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createBotApi(platform.id, {
        name: newBotName.trim(),
        credentials: {
          bot_token: apiKey.trim(),
          secret_key: secretKey.trim(),
        },
      });
      const mapped = mapBotFromApi(created);
      setBots((prev) => [...prev, mapped]);
      setSelectedBotId("");
      setNewBotName("");
      setApiKey("");
      setSecretKey("");
      setShowAddModal(false);
      notifySuccess(t.toast.botCreated);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        router.replace(`/${locale}/login`);
        return;
      }
      const msg = getErrorMessage(error, t.auth.common.defaultError);
      setErrorMessage(msg);
      notifyError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteBot(bot: Bot, event: React.MouseEvent) {
    event.stopPropagation();
    setOpenMenuId(null);
    if (!confirm(t.dashboard.deleteConfirm)) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await deactivateBotApi(bot.id);
      setBots((prev) => prev.filter((b) => b.id !== bot.id));
      if (selectedBotId === bot.id) {
        setSelectedBotId("");
      }
      notifySuccess(t.toast.botDeactivated);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        router.replace(`/${locale}/login`);
        return;
      }
      const msg = getErrorMessage(error, t.auth.common.defaultError);
      setErrorMessage(msg);
      notifyError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEditBot(bot: Bot, event: React.MouseEvent) {
    event.stopPropagation();
    setEditingBotId(bot.id);
    setEditingBotName(bot.name);
    setOpenMenuId(null);
  }

  async function handleSaveEditBot(botId: string, event: React.MouseEvent | React.FormEvent) {
    event.stopPropagation();
    event.preventDefault();
    if (!editingBotName.trim()) return;

    const currentBot = bots.find((bot) => bot.id === botId);
    if (!currentBot) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const updated = await updateBotApi(botId, {
        name: editingBotName.trim(),
        credentials: currentBot.credentials ?? {},
      });
      const mapped = mapBotFromApi(updated);
      setBots((prev) => prev.map((b) => (b.id === botId ? mapped : b)));
      setEditingBotId(null);
      setEditingBotName("");
      notifySuccess(t.toast.botUpdated);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        router.replace(`/${locale}/login`);
        return;
      }
      const msg = getErrorMessage(error, t.auth.common.defaultError);
      setErrorMessage(msg);
      notifyError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancelEditBot(event: React.MouseEvent) {
    event.stopPropagation();
    setEditingBotId(null);
    setEditingBotName("");
  }

  if (!platform) return null;

  return (
    <>
      <main className="min-h-screen">
      <header className={`${platform.headerClassName} border-b px-6 py-4 shadow-sm`}>
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center text-xl font-semibold">
              <img src={platform.logo} alt={platform.name} className="mr-2 h-6 w-6 object-contain" />
              {platform.name} {t.dashboard.titleSuffix}
            </h1>
            <p className="text-sm text-white/90">
              {t.dashboard.subtitle(platform.name)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-medium">{t.dashboard.currentBot}</label>
            <select
              value={selectedBotId}
              onChange={(event) => setSelectedBotId(event.target.value)}
              className="min-w-56 rounded-lg border border-white/30 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
            >
              <option value="">{t.dashboard.chooseBot}</option>
              {bots.map((bot) => (
                <option key={bot.id} value={bot.id}>
                  {bot.name} ({bot.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {errorMessage ? (
        <div className="mx-auto mt-4 w-full max-w-7xl px-6">
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {errorMessage}
          </div>
        </div>
      ) : null}

      {!selectedBotId ? (
        <div className="mx-auto w-full max-w-5xl p-6">
          <div className="mb-8 mt-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              {bots.length === 0 ? t.dashboard.noBotTitle(platform.name) : t.dashboard.selectBotTitle}
            </h2>
            <p className="mt-2 text-slate-600">
              {bots.length === 0 ? t.dashboard.noBotDescription : t.dashboard.selectBotDescription}
            </p>
            {isLoadingBots ? (
              <p className="mt-2 text-sm text-slate-500">{t.dashboard.loadingBots}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {bots.map((bot) => (
              <div
                key={bot.id}
                onClick={() => {
                  if (editingBotId !== bot.id) {
                    setSelectedBotId(bot.id);
                  }
                }}
                className="relative flex h-[240px] w-56 cursor-pointer flex-col justify-between rounded-[20px] bg-slate-50 p-5 shadow-sm transition hover:shadow-md"
              >
                {/* Top bar */}
                <div className="flex w-full items-center justify-between">
                  <span className="max-w-[140px] truncate text-[13px] font-semibold text-slate-700">
                    {bot.id}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === bot.id ? null : bot.id);
                    }}
                    className="rounded-full p-1 text-slate-500 hover:bg-slate-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                  </button>
                  {openMenuId === bot.id && (
                    <div className="absolute right-4 top-10 z-10 w-32 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                      <button
                        onClick={(e) => handleEditBot(bot, e)}
                        className="flex w-full items-center px-4 py-2.5 text-sm outline-none text-slate-700 hover:bg-slate-50"
                      >
                        {t.dashboard.editBot}
                      </button>
                      <button
                        onClick={(e) => void handleDeleteBot(bot, e)}
                        className="flex w-full items-center border-t border-slate-100 px-4 py-2.5 outline-none text-sm text-red-600 hover:bg-red-50"
                      >
                        {t.dashboard.deleteBot}
                      </button>
                    </div>
                  )}
                </div>

                {/* Center Avatar */}
                <div className="flex flex-1 items-center justify-center pointer-events-none mt-2">
                  <div className="relative">
                    <div
                      className={`flex h-[88px] w-[88px] items-center justify-center rounded-full text-4xl font-normal text-white ${getAvatarColor(bot.id)}`}
                    >
                      {bot.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white p-1 shadow-[0_0_4px_rgba(0,0,0,0.1)] border border-slate-100">
                      <img
                        src={platform.logo}
                        alt={platform.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom section */}
                <div className="pb-1 mt-auto w-full text-center">
                  {editingBotId === bot.id ? (
                    <form
                      onSubmit={(e) => handleSaveEditBot(bot.id, e)}
                      className="flex w-full flex-col gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        value={editingBotName}
                        onChange={(e) => setEditingBotName(e.target.value)}
                        className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 rounded bg-slate-800 py-1 text-[11px] text-white hover:bg-slate-700"
                        >
                          {isSubmitting ? t.auth.common.submitting : t.dashboard.save}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditBot}
                          className="flex-1 rounded bg-slate-200 py-1 text-[11px] text-slate-700 hover:bg-slate-300"
                        >
                          {t.dashboard.cancel}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-1">
                      <span className="block w-full truncate text-[15px] font-medium text-slate-700">
                        {bot.name}
                      </span>
                      {bot.status ? (
                        <span className="block text-[11px] uppercase tracking-wide text-slate-400">
                          {bot.status}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add Card */}
            <div
              onClick={() => setShowAddModal(true)}
              className="group flex h-[240px] w-56 cursor-pointer flex-col items-center justify-between rounded-[20px] border-2 border-dashed border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <div className="w-full text-center">
                <span className="text-[15px] font-bold text-slate-700">
                  Add
                </span>
              </div>
              <div className="flex flex-1 items-center justify-center">
                <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors group-hover:bg-slate-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
              </div>
              <div className="pb-1 mt-auto h-6" />
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto grid w-full max-w-7xl gap-6 p-6 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {t.dashboard.menuTitle}
            </h2>
            <nav className="space-y-2">
              {DASHBOARD_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                    activeSection === section.id
                      ? `${platform.accentClassName}`
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {t.dashboard.section[section.id].title}
                </button>
              ))}
            </nav>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-6">
              <div className={`rounded-xl border p-4 ${platform.surfaceClassName}`}>
                <p className="text-sm text-slate-700">{t.dashboard.selectedBot}</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">
                  {selectedBot?.name}
                </h3>
                <p className="font-mono text-sm text-slate-600">bot_id: {selectedBot?.id}</p>
              </div>

              {activeSection === "store" && selectedBot ? (
                <StoreManagement
                  locale={locale}
                  platform={platform}
                  selectedBot={selectedBot}
                />
              ) : (
                DASHBOARD_SECTIONS.filter((section) => section.id === activeSection).map(
                  (section) => (
                    <article key={section.id} className="space-y-3">
                      <h3 className="text-2xl font-semibold text-slate-900">
                        {t.dashboard.section[section.id].title}
                      </h3>
                      <p className="text-slate-600">
                        {t.dashboard.section[section.id].description}
                      </p>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                          {t.dashboard.stats.total}: 120
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                          {t.dashboard.stats.active}: 94
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                          {t.dashboard.stats.pending}: 26
                        </div>
                      </div>
                    </article>
                  ),
                )
              )}
            </div>
          </section>
        </div>
      )}
    </main>

      {/* Add Bot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowAddModal(false)}>
          <div 
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 outline-none"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            <h3 className="mb-2 text-xl font-semibold text-slate-900">
              {t.dashboard.createBot}
            </h3>
            <p className="mb-6 text-sm text-slate-500">
              {t.dashboard.noBotDescription}
            </p>
            <form onSubmit={handleCreateBot} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {t.dashboard.inputBotName}
                </label>
                <input
                  value={newBotName}
                  onChange={(event) => setNewBotName(event.target.value)}
                  placeholder={t.dashboard.inputBotName}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">API Key</label>
                <input
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder="Nhập API Key"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Secret Key</label>
                <input
                  value={secretKey}
                  onChange={(event) => setSecretKey(event.target.value)}
                  type="password"
                  placeholder="Nhập Secret Key"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {t.dashboard.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`rounded-lg px-6 py-2 text-sm font-medium ${platform.accentClassName} ${platform.hoverClassName}`}
                >
                  {isSubmitting ? t.auth.common.submitting : t.dashboard.createBot}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
