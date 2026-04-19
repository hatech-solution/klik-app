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
import { getMessages, type Locale } from "@/lib/i18n";
import { PlatformId, PLATFORM_CONFIGS } from "@/lib/platforms";
import type { Bot } from "@/lib/types/bot";
import { usePlatformStore } from "@/store/usePlatformStore";

const SESSION_BOT_KEY = "bot_id";

export type PlatformBotWorkspaceMode = "selectBot" | "dashboardShell";

export function usePlatformBotWorkspace(locale: Locale, mode: PlatformBotWorkspaceMode) {
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
  const [editingBotId, setEditingBotId] = useState<string | null>(null);
  const [editingBotName, setEditingBotName] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoadingBots, setIsLoadingBots] = useState(false);
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

  useEffect(() => {
    if (mode !== "selectBot") return;
    if (!botsListReady) return;
    if (!selectedBotId) return;
    if (!bots.some((b) => b.id === selectedBotId)) return;
    router.replace(`/${locale}/dashboard`);
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

  return {
    platform,
    bots,
    selectedBotId,
    setSelectedBotId,
    selectedBot,
    newBotName,
    setNewBotName,
    apiKey,
    setApiKey,
    secretKey,
    setSecretKey,
    editingBotId,
    editingBotName,
    setEditingBotName,
    openMenuId,
    setOpenMenuId,
    showAddModal,
    setShowAddModal,
    isLoadingBots,
    botsListReady,
    errorMessage,
    isSubmitting,
    handleCreateBot,
    handleDeleteBot,
    handleEditBot,
    handleSaveEditBot,
    handleCancelEditBot,
    t,
  };
}
