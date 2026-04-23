"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getErrorMessage, isUnauthorizedError } from "@/lib/api/error";
import { notifyError, notifySuccess } from "@/lib/toast";
import {
  deactivateBotApi,
  listBotsApi,
  mapBotFromApi,
  updateBotApi,
} from "@/lib/api/bot";
import { getMessages, type Locale } from "@/lib/i18n";
import { PlatformId, PLATFORM_CONFIGS } from "@/lib/platforms";
import type { Bot } from "@/lib/types/bot";
import { usePlatformStore } from "@/store/usePlatformStore";

const SESSION_BOT_KEY = "bot_id";
const BOTS_CACHE_TTL_MS = 5 * 60 * 1000;

type BotsCacheEntry = {
  bots: Bot[];
  updatedAt: number;
};

const botsCacheByPlatform: Partial<Record<PlatformId, BotsCacheEntry>> = {};

export type PlatformBotWorkspaceMode = "selectBot" | "dashboardShell";

export function usePlatformBotWorkspace(locale: Locale, mode: PlatformBotWorkspaceMode) {
  const router = useRouter();
  const t = getMessages(locale);
  const { platformId, loadFromStorage } = usePlatformStore();

  const platform = platformId ? PLATFORM_CONFIGS[platformId as PlatformId] : undefined;
  const [platformHydrated, setPlatformHydrated] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem("platform_id"));
  });

  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(SESSION_BOT_KEY) ?? "";
  });
  const [editingBotId, setEditingBotId] = useState<string | null>(null);
  const [editingBotName, setEditingBotName] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isLoadingBots, setIsLoadingBots] = useState(false);
  const [botsListReady, setBotsListReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateBotsForPlatform = useCallback(
    (nextBotsOrUpdater: Bot[] | ((prev: Bot[]) => Bot[])) => {
      setBots((prev) => {
        const nextBots =
          typeof nextBotsOrUpdater === "function" ? nextBotsOrUpdater(prev) : nextBotsOrUpdater;
        if (platform) {
          botsCacheByPlatform[platform.id] = {
            bots: nextBots,
            updatedAt: Date.now(),
          };
        }
        return nextBots;
      });
    },
    [platform],
  );

  useEffect(() => {
    if (!openMenuId) return;
    const handleClick = () => setOpenMenuId(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [openMenuId]);

  useEffect(() => {
    loadFromStorage();
    setPlatformHydrated(true);
  }, [loadFromStorage]);

  useEffect(() => {
    if (!platformHydrated) return;
    if (platform) return;
    router.replace(`/${locale}/select-platform`);
  }, [platformHydrated, platform, locale, router]);

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
      setIsLoadingBots(false);
      return;
    }

    const currentPlatform = platform;
    const cached = botsCacheByPlatform[currentPlatform.id];
    const hasUsableCache = Boolean(cached && cached.bots.length > 0);
    const cacheIsFresh = Boolean(cached && Date.now() - cached.updatedAt < BOTS_CACHE_TTL_MS);
    let cancelled = false;

    if (hasUsableCache && cached) {
      setBots(cached.bots);
      setBotsListReady(true);
    } else {
      setBotsListReady(false);
    }

    // In dashboard shell, prefer cached bots to avoid refetching every route.
    // Select-bot screen still refreshes from API to keep management actions accurate.
    if (mode === "dashboardShell" && cacheIsFresh) {
      setIsLoadingBots(false);
      return () => {
        cancelled = true;
      };
    }

    async function loadBots() {
      setIsLoadingBots(!hasUsableCache);
      setErrorMessage(null);
      try {
        const rows = await listBotsApi(currentPlatform.id);
        if (cancelled) return;
        const mapped = rows.map(mapBotFromApi);
        updateBotsForPlatform(mapped);
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
  }, [platform, mode, locale, router, t.auth.common.defaultError, updateBotsForPlatform]);

  useEffect(() => {
    if (!botsListReady) return;
    if (!selectedBotId) return;
    if (bots.some((bot) => bot.id === selectedBotId)) return;
    setSelectedBotId("");
  }, [bots, selectedBotId, botsListReady]);

  useEffect(() => {
    if (mode !== "selectBot") return;
    if (!botsListReady) return;
    if (!selectedBotId) return;
    if (!bots.some((b) => b.id === selectedBotId)) return;
    router.replace(`/${locale}/overview`);
  }, [mode, botsListReady, selectedBotId, bots, locale, router]);

  useEffect(() => {
    if (mode !== "dashboardShell") return;
    if (!botsListReady) return;
    if (selectedBotId) return;
    router.replace(`/${locale}/select-bot`);
  }, [mode, botsListReady, selectedBotId, locale, router]);

  const selectedBot = useMemo(
    () => bots.find((bot) => bot.id === selectedBotId),
    [bots, selectedBotId],
  );

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
      updateBotsForPlatform((prev) => prev.filter((b) => b.id !== bot.id));
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
      updateBotsForPlatform((prev) => prev.map((b) => (b.id === botId ? mapped : b)));
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

  return {
    platformHydrated,
    platform,
    bots,
    selectedBotId,
    setSelectedBotId,
    selectedBot,
    editingBotId,
    editingBotName,
    setEditingBotName,
    openMenuId,
    setOpenMenuId,
    isLoadingBots,
    botsListReady,
    errorMessage,
    isSubmitting,
    handleDeleteBot,
    handleEditBot,
    handleSaveEditBot,
    handleCancelEditBot,
    t,
  };
}
