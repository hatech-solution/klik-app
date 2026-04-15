"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { getMessages, Locale } from "@/lib/i18n";
import { DASHBOARD_SECTIONS, INITIAL_BOTS, Bot } from "@/lib/mock-data";
import { PlatformConfig, PlatformId, PLATFORM_CONFIGS } from "@/lib/platforms";
import { usePlatformStore } from "@/store/usePlatformStore";

const SESSION_BOT_KEY = "selected_bot_id";

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
    if (typeof window === "undefined") {
      return "";
    }
    return sessionStorage.getItem(makeBotKey(platform.id)) ?? "";
  });
  const [newBotName, setNewBotName] = useState("");
  const [activeSection, setActiveSection] = useState<DashboardSectionId>("store");

  useEffect(() => {
    if (!selectedBotId) {
      sessionStorage.removeItem(makeBotKey(platform.id));
      return;
    }
    sessionStorage.setItem(makeBotKey(platform.id), selectedBotId);
  }, [platform.id, selectedBotId]);

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

      <div className="mx-auto grid w-full max-w-7xl gap-6 p-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
          {bots.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-lg font-semibold text-amber-900">
                {t.dashboard.noBotTitle(platform.name)}
              </h3>
              <p className="mt-1 text-sm text-amber-800">
                {t.dashboard.noBotDescription}
              </p>
              <form onSubmit={handleCreateBot} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  value={newBotName}
                  onChange={(event) => setNewBotName(event.target.value)}
                  placeholder={t.dashboard.inputBotName}
                  className="flex-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm outline-none ring-amber-500 focus:ring"
                />
                <button
                  type="submit"
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${platform.accentClassName} ${platform.hoverClassName}`}
                >
                  {t.dashboard.createBot}
                </button>
              </form>
            </div>
          ) : !selectedBot ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {t.dashboard.selectBotTitle}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {t.dashboard.selectBotDescription}
              </p>
              <form onSubmit={handleCreateBot} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  value={newBotName}
                  onChange={(event) => setNewBotName(event.target.value)}
                  placeholder={t.dashboard.quickCreateBot}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-500 focus:ring"
                />
                <button
                  type="submit"
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${platform.accentClassName} ${platform.hoverClassName}`}
                >
                  {t.dashboard.createBot}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div className={`rounded-xl border p-4 ${platform.surfaceClassName}`}>
                <p className="text-sm text-slate-700">{t.dashboard.selectedBot}</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">
                  {selectedBot.name}
                </h3>
                <p className="text-sm text-slate-600">bot_id: {selectedBot.id}</p>
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
          )}
        </section>
      </div>
    </main>
  );
}

function makeBotKey(platformId: PlatformId) {
  return `${SESSION_BOT_KEY}_${platformId}`;
}
