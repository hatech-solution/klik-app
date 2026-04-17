import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { SelectPlatformView } from "@/components/platform/select-platform-view";
import { isUserLoggedInServer } from "@/lib/auth-tokens-server";
import { getMessages, isLocale } from "@/lib/i18n";

type LocaleSelectPlatformPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LocaleSelectPlatformPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const t = getMessages(locale);
  return {
    title: t.meta.selectTitle,
    description: t.meta.selectDescription,
  };
}

export default async function LocaleSelectPlatformPage({
  params,
}: LocaleSelectPlatformPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const isLoggedIn = await isUserLoggedInServer();
  if (!isLoggedIn) {
    redirect(`/${locale}/login`);
  }

  return <SelectPlatformView locale={locale} />;
}
