import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { BotUpsertFormPage } from "@/components/platform/bot-upsert-form-page";
import { RouteGuard } from "@/components/providers/route-guard";
import { isUserLoggedInServer } from "@/lib/auth-tokens-server";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string; botId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale);
  return {
    title: `${t.dashboard.updateBotPageTitle} - ${t.meta.appTitle}`,
    description: t.dashboard.updateBotPageDescription,
  };
}

export default async function BotEditPage({ params }: PageProps) {
  const { locale, botId } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const isLoggedIn = await isUserLoggedInServer();
  if (!isLoggedIn) {
    redirect(`/${locale}/login`);
  }

  return (
    <RouteGuard locale={locale}>
      <BotUpsertFormPage locale={locale as Locale} mode="edit" botId={botId} />
    </RouteGuard>
  );
}
