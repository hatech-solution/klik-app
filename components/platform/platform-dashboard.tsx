"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { getMessages, Locale } from "@/lib/i18n";
import { DASHBOARD_SECTIONS, INITIAL_BOTS, Bot } from "@/lib/mock-data";
import { PlatformConfig, PlatformId, PLATFORM_CONFIGS } from "@/lib/platforms";
import { usePlatformStore } from "@/store/usePlatformStore";

const SESSION_BOT_KEY = "bot_id";

type PlatformDashboardProps = {
  locale: Locale;
};

type DashboardSectionId = (typeof DASHBOARD_SECTIONS)[number]["id"];

export function PlatformDashboard({ locale }: PlatformDashboardProps) {
  const t = getMessages(locale);
  const { platformId } = usePlatformStore();
  
  if (!platformId) return null;
  const platform = PLATFORM_CONFIGS[platformId as PlatformId];
  if (!platform) return null;

  const [bots, setBots] = useState<Bot[]>(INITIAL_BOTS[platform.id]);
  const [selectedBotId, setSelectedBotId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(SESSION_BOT_KEY) ?? "";
  });
  const [newBotName, setNewBotName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [activeSection, setActiveSection] = useState<DashboardSectionId>("store");

  useEffect(() => {
    if (!selectedBotId) {
      localStorage.removeItem(SESSION_BOT_KEY);
      return;
    }
    localStorage.setItem(SESSION_BOT_KEY, selectedBotId);
  }, [selectedBotId]);

  const selectedBot = useMemo(
    () => bots.find((bot) => bot.id === selectedBotId),
    [bots, selectedBotId],
  );

  function handleCreateBot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newBotName.trim()) {
      return;
    }

    const normalized = newBotName.trim().toLowerCase().replace(/\s+/g, "-");
    const newBot: Bot = {
      id: `${platform.id}-bot-${normalized}-${Math.floor(Math.random() * 1000)}`,
      name: newBotName.trim(),
    };

    setBots((prev) => [...prev, newBot]);
    setSelectedBotId(newBot.id);
    setNewBotName("");
    setApiKey("");
    setSecretKey("");
  }

  return (
    <main className="min-h-screen">
      <header className={`${platform.headerClassName} border-b px-6 py-4 shadow-sm`}>
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">
              {platform.logo} {platform.name} {t.dashboard.titleSuffix}
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

      {!selectedBotId ? (
        bots.length === 0 ? (
          <div className="mx-auto w-full max-w-2xl p-6">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <h3 className="mb-2 text-xl font-semibold text-amber-900">
                {t.dashboard.noBotTitle(platform.name)}
              </h3>
              <p className="mb-6 text-sm text-amber-800">
                {t.dashboard.noBotDescription}
              </p>
              <form onSubmit={handleCreateBot} className="flex flex-col gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-amber-900">
                    {t.dashboard.inputBotName}
                  </label>
                  <input
                    value={newBotName}
                    onChange={(event) => setNewBotName(event.target.value)}
                    placeholder={t.dashboard.inputBotName}
                    className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm outline-none ring-amber-500 focus:ring"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-amber-900">API Key</label>
                  <input
                    value={apiKey}
                    onChange={(event) => setApiKey(event.target.value)}
                    placeholder="Nhập API Key"
                    className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm outline-none ring-amber-500 focus:ring"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-amber-900">Secret Key</label>
                  <input
                    value={secretKey}
                    onChange={(event) => setSecretKey(event.target.value)}
                    type="password"
                    placeholder="Nhập Secret Key"
                    className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm outline-none ring-amber-500 focus:ring"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className={`mt-2 w-max rounded-lg px-6 py-2 text-sm font-medium ${platform.accentClassName} ${platform.hoverClassName}`}
                >
                  {t.dashboard.createBot}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-5xl p-6">
            <div className="mb-8 mt-12 text-center">
              <h2 className="text-3xl font-bold text-slate-900">{t.dashboard.selectBotTitle}</h2>
              <p className="mt-2 text-slate-600">{t.dashboard.selectBotDescription}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {bots.map((bot) => (
                <button
                  key={bot.id}
                  onClick={() => setSelectedBotId(bot.id)}
                  className="flex h-40 w-64 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400 hover:shadow-md"
                >
                  <div className="text-4xl">{platform.logo}</div>
                  <span className="text-lg font-semibold text-slate-900">{bot.name}</span>
                  <span className="font-mono text-xs text-slate-500">{bot.id}</span>
                </button>
              ))}
            </div>
          </div>
        )
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

              {DASHBOARD_SECTIONS.filter((section) => section.id === activeSection).map(
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
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
