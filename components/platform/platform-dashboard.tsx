"use client";

import { BotSelectCardSkeleton } from "@/components/ui/screen-loading-skeletons";
import { usePlatformBotWorkspace } from "@/components/platform/use-platform-bot-workspace";
import { getMessages, type Locale } from "@/lib/i18n";
import { PlatformId, PLATFORM_CONFIGS, type PlatformConfig } from "@/lib/platforms";
import type { Bot } from "@/lib/types/bot";
import { usePlatformStore } from "@/store/usePlatformStore";

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

export type PlatformDashboardFlow = "selectBot";

type PlatformDashboardProps = {
  locale: Locale;
  /** Chỉ còn màn chọn bot (`/select-bot`). Phần dashboard chính nằm ở `DashboardShell`. */
  flow?: PlatformDashboardFlow;
};

export function PlatformDashboard({ locale, flow = "selectBot" }: PlatformDashboardProps) {
  const { platformId } = usePlatformStore();
  const platform = platformId ? PLATFORM_CONFIGS[platformId as PlatformId] : undefined;

  const ws = usePlatformBotWorkspace(locale, flow);

  if (!platform) return null;

  const {
    bots,
    selectedBotId,
    setSelectedBotId,
    isLoadingBots,
    errorMessage,
    editingBotId,
    editingBotName,
    setEditingBotName,
    openMenuId,
    setOpenMenuId,
    showAddModal,
    setShowAddModal,
    newBotName,
    setNewBotName,
    apiKey,
    setApiKey,
    secretKey,
    setSecretKey,
    isSubmitting,
    handleCreateBot,
    handleDeleteBot,
    handleEditBot,
    handleSaveEditBot,
    handleCancelEditBot,
    t,
  } = ws;

  return (
    <>
      <main className="min-h-screen">
        <header className={`${platform.headerClassName} dashboard-header border-b px-6 py-4 shadow-sm`}>
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="flex items-center text-xl font-semibold">
                <img src={platform.logo} alt={platform.name} className="mr-2 h-6 w-6 object-contain" />
                {platform.name} {t.dashboard.titleSuffix}
              </h1>
              <p className="text-sm text-white/90">{t.dashboard.subtitle(platform.name)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm font-medium">{t.dashboard.currentBot}</label>
              <select
                value={selectedBotId}
                onChange={(event) => setSelectedBotId(event.target.value)}
                className="dashboard-bot-select"
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
            <div className="dm-alert-error dm-alert-tight">{errorMessage}</div>
          </div>
        ) : null}

        <div className="mx-auto w-full max-w-5xl p-6">
            <div className="mb-8 mt-12 text-center">
              <h2 className="dm-select-bot-hero">
                {bots.length === 0 ? t.dashboard.noBotTitle(platform.name) : t.dashboard.selectBotTitle}
              </h2>
              <p className="dm-select-bot-sub">
                {bots.length === 0 ? t.dashboard.noBotDescription : t.dashboard.selectBotDescription}
              </p>
            </div>
            <div
              className="flex flex-wrap justify-center gap-6"
              aria-busy={isLoadingBots && bots.length === 0}
              aria-label={isLoadingBots && bots.length === 0 ? t.dashboard.loadingBots : undefined}
              role={isLoadingBots && bots.length === 0 ? "status" : undefined}
            >
              {isLoadingBots && bots.length === 0
                ? [0, 1, 2].map((i) => <BotSelectCardSkeleton key={`bot-sk-${i}`} />)
                : null}
              {!isLoadingBots || bots.length > 0
                ? bots.map((bot) => (
                    <BotSelectCard
                      key={bot.id}
                      bot={bot}
                      platform={platform}
                      editingBotId={editingBotId}
                      editingBotName={editingBotName}
                      setEditingBotName={setEditingBotName}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                      isSubmitting={isSubmitting}
                      setSelectedBotId={setSelectedBotId}
                      onEdit={handleEditBot}
                      onDelete={handleDeleteBot}
                      onSaveEdit={handleSaveEditBot}
                      onCancelEdit={handleCancelEditBot}
                      t={t}
                    />
                  ))
                : null}

              <div
                onClick={() => setShowAddModal(true)}
                className="dm-bot-add-tile group flex flex-col items-center justify-between"
              >
                <div className="w-full text-center">
                  <span className="dm-bot-add-label">Add</span>
                </div>
                <div className="flex flex-1 items-center justify-center">
                  <div className="dm-bot-add-icon-wrap flex h-[88px] w-[88px] items-center justify-center rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                </div>
                <div className="mt-auto h-6 pb-1" />
              </div>
            </div>
          </div>
      </main>

      {showAddModal ? (
        <div
          className="dm-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="dm-modal-panel relative w-full max-w-md p-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="dm-modal-close absolute right-4 top-4 outline-none"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <h3 className="mb-2 text-xl font-semibold text-[var(--dm-text)]">{t.dashboard.createBot}</h3>
            <p className="mb-6 text-sm text-[var(--dm-text-muted)]">{t.dashboard.noBotDescription}</p>
            <form onSubmit={handleCreateBot} className="flex flex-col gap-4">
              <div>
                <label className="dm-label mb-1 block">{t.dashboard.inputBotName}</label>
                <input
                  value={newBotName}
                  onChange={(event) => setNewBotName(event.target.value)}
                  placeholder={t.dashboard.inputBotName}
                  className="dm-input"
                  required
                />
              </div>
              <div>
                <label className="dm-label mb-1 block">API Key</label>
                <input
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder="Nhập API Key"
                  className="dm-input"
                  required
                />
              </div>
              <div>
                <label className="dm-label mb-1 block">Secret Key</label>
                <input
                  value={secretKey}
                  onChange={(event) => setSecretKey(event.target.value)}
                  type="password"
                  placeholder="Nhập Secret Key"
                  className="dm-input"
                  required
                />
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="dm-btn-ghost"
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
      ) : null}
    </>
  );
}

type DashboardMessages = ReturnType<typeof getMessages>;

function BotSelectCard({
  bot,
  platform,
  editingBotId,
  editingBotName,
  setEditingBotName,
  openMenuId,
  setOpenMenuId,
  isSubmitting,
  setSelectedBotId,
  onEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  t,
}: {
  bot: Bot;
  platform: PlatformConfig;
  editingBotId: string | null;
  editingBotName: string;
  setEditingBotName: (v: string) => void;
  openMenuId: string | null;
  setOpenMenuId: (v: string | null) => void;
  isSubmitting: boolean;
  setSelectedBotId: (id: string) => void;
  onEdit: (bot: Bot, e: React.MouseEvent) => void;
  onDelete: (bot: Bot, e: React.MouseEvent) => void | Promise<void>;
  onSaveEdit: (botId: string, e: React.MouseEvent | React.FormEvent) => void | Promise<void>;
  onCancelEdit: (e: React.MouseEvent) => void;
  t: DashboardMessages;
}) {
  return (
    <div
      onClick={() => {
        if (editingBotId !== bot.id) {
          setSelectedBotId(bot.id);
        }
      }}
      className="dm-bot-card"
    >
      <div className="flex w-full items-center justify-between">
        <span className="dm-bot-card-meta max-w-[140px]">{bot.id}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenuId(openMenuId === bot.id ? null : bot.id);
          }}
          className="dm-menu-trigger"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
        {openMenuId === bot.id ? (
          <div className="dm-bot-menu">
            <button
              type="button"
              onClick={(e) => onEdit(bot, e)}
              className="dm-bot-menu-item"
            >
              {t.dashboard.editBot}
            </button>
            <button
              type="button"
              onClick={(e) => void onDelete(bot, e)}
              className="dm-bot-menu-item dm-bot-menu-item--danger"
            >
              {t.dashboard.deleteBot}
            </button>
          </div>
        ) : null}
      </div>

      <div className="pointer-events-none mt-2 flex flex-1 items-center justify-center">
        <div className="relative">
          <div
            className={`flex h-[88px] w-[88px] items-center justify-center rounded-full text-4xl font-normal text-white ${getAvatarColor(bot.id)}`}
          >
            {bot.name.charAt(0).toUpperCase()}
          </div>
          <div className="dm-bot-badge-ring">
            <img src={platform.logo} alt={platform.name} className="h-full w-full object-contain" />
          </div>
        </div>
      </div>

      <div className="mt-auto w-full pb-1 text-center">
        {editingBotId === bot.id ? (
          <form
            onSubmit={(e) => void onSaveEdit(bot.id, e)}
            className="flex w-full flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              value={editingBotName}
              onChange={(e) => setEditingBotName(e.target.value)}
              className="dm-bot-edit-input"
              autoFocus
            />
            <div className="flex gap-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="dm-bot-edit-save"
              >
                {isSubmitting ? t.auth.common.submitting : t.dashboard.save}
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="dm-bot-edit-cancel"
              >
                {t.dashboard.cancel}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-1">
            <span className="dm-bot-card-name">{bot.name}</span>
            {bot.status ? (
              <span className="dm-bot-card-status">{bot.status}</span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
