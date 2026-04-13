import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RegisterForm } from "@/components/forms/register-form";
import { getMessages, isLocale } from "@/lib/i18n";

type LocaleRegisterPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LocaleRegisterPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const t = getMessages(locale);
  return {
    title: t.meta.registerTitle,
    description: t.meta.registerDescription,
  };
}

export default async function LocaleRegisterPage({
  params,
}: LocaleRegisterPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  return <RegisterForm locale={locale} />;
}
