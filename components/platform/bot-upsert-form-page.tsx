"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { getErrorMessage, isUnauthorizedError } from "@/lib/api/error";
import { createBotApi, listBotsApi, mapBotFromApi, updateBotApi } from "@/lib/api/bot";
import { getMessages, type Locale } from "@/lib/i18n";
import { PlatformId, PLATFORM_CONFIGS } from "@/lib/platforms";
import { notifyError, notifySuccess } from "@/lib/toast";
import { usePlatformStore } from "@/store/usePlatformStore";

type BotUpsertFormPageProps = {
  locale: Locale;
  mode: "create" | "edit";
  botId?: string;
};

export function BotUpsertFormPage({ locale, mode, botId }: BotUpsertFormPageProps) {
  const router = useRouter();
  const t = getMessages(locale);
  const { platformId, loadFromStorage } = usePlatformStore();
  const platform = platformId ? PLATFORM_CONFIGS[platformId as PlatformId] : undefined;

  const [platformHydrated, setPlatformHydrated] = useState(false);
  const [isLoadingBot, setIsLoadingBot] = useState(mode === "edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [existingCredentials, setExistingCredentials] = useState<Record<string, unknown>>({});

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
    if (mode !== "edit" || !platform || !botId) {
      setIsLoadingBot(false);
      return;
    }

    let cancelled = false;

    async function loadBot() {
      setIsLoadingBot(true);
      setErrorMessage(null);
      try {
        if (!platform) return;
        const rows = await listBotsApi(platform.id);
        if (cancelled) return;
        const bot = rows.map(mapBotFromApi).find((item) => item.id === botId);
        if (!bot) {
          setErrorMessage(t.auth.common.defaultError);
          return;
        }
        const credentials = (bot.credentials ?? {}) as Record<string, unknown>;
        setName(bot.name);
        setApiKey(typeof credentials.bot_token === "string" ? credentials.bot_token : "");
        setSecretKey(typeof credentials.secret_key === "string" ? credentials.secret_key : "");
        setExistingCredentials(credentials);
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
          setIsLoadingBot(false);
        }
      }
    }

    void loadBot();
    return () => {
      cancelled = true;
    };
  }, [mode, platform, botId, locale, router, t.auth.common.defaultError]);

  const pageTitle =
    mode === "create" ? t.dashboard.addBotPageTitle : t.dashboard.updateBotPageTitle;
  const pageDescription =
    mode === "create"
      ? t.dashboard.addBotPageDescription
      : t.dashboard.updateBotPageDescription;

  const submitLabel = useMemo(() => {
    if (isSubmitting) return t.auth.common.submitting;
    return mode === "create" ? t.dashboard.createBot : t.dashboard.saveChanges;
  }, [isSubmitting, mode, t.auth.common.submitting, t.dashboard.createBot, t.dashboard.saveChanges]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!platform) return;

    const trimmedName = name.trim();
    const trimmedApiKey = apiKey.trim();
    const trimmedSecretKey = secretKey.trim();
    if (!trimmedName || !trimmedApiKey || !trimmedSecretKey) return;

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createBotApi(platform.id, {
          name: trimmedName,
          credentials: {
            bot_token: trimmedApiKey,
            secret_key: trimmedSecretKey,
          },
        });
        notifySuccess(t.toast.botCreated);
      } else if (botId) {
        await updateBotApi(botId, {
          name: trimmedName,
          credentials: {
            ...existingCredentials,
            bot_token: trimmedApiKey,
            secret_key: trimmedSecretKey,
          },
        });
        notifySuccess(t.toast.botUpdated);
      }
      router.push(`/${locale}/select-bot`);
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

  if (!platformHydrated || !platform) {
    return null;
  }

  return (
    <main className="min-h-screen">
      <header className={`${platform.headerClassName} dashboard-header border-b px-6 py-4 shadow-sm`}>
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3">
          <h1 className="flex items-center text-xl font-semibold">
            <Image
              src={platform.logo}
              alt={platform.name}
              width={24}
              height={24}
              className="mr-2 h-6 w-6 object-contain"
            />
            {platform.name} {t.dashboard.titleSuffix}
          </h1>
          <p className="text-sm text-white/90">{t.dashboard.subtitle(platform.name)}</p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl p-6">
        <div className="rounded-2xl border border-[var(--dm-border)] bg-[var(--dm-card)] p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-[var(--dm-text)]">{pageTitle}</h2>
          <p className="mt-2 text-sm text-[var(--dm-text-muted)]">{pageDescription}</p>

          {errorMessage ? (
            <div className="dm-alert-error dm-alert-tight mt-4">{errorMessage}</div>
          ) : null}

          {isLoadingBot ? (
            <div className="mt-6 text-sm text-[var(--dm-text-muted)]">{t.dashboard.loadingBots}</div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="dm-label mb-1 block">{t.dashboard.inputBotName}</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={t.dashboard.inputBotName}
                  className="dm-input"
                  required
                />
              </div>
              <div>
                <label className="dm-label mb-1 block">{t.dashboard.botApiKey}</label>
                <input
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder={t.dashboard.botApiKeyPlaceholder}
                  className="dm-input"
                  required
                />
              </div>
              <div>
                <label className="dm-label mb-1 block">{t.dashboard.botSecretKey}</label>
                <input
                  value={secretKey}
                  onChange={(event) => setSecretKey(event.target.value)}
                  placeholder={t.dashboard.botSecretKeyPlaceholder}
                  className="dm-input"
                  type="password"
                  required
                />
              </div>
              <div className="mt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.push(`/${locale}/select-bot`)}
                  className="dm-btn-ghost"
                >
                  {t.dashboard.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`rounded-lg px-6 py-2 text-sm font-medium ${platform.accentClassName} ${platform.hoverClassName}`}
                >
                  {submitLabel}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
