import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { getMessages, isLocale } from "@/lib/i18n";

type LocaleResetPasswordPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LocaleResetPasswordPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const t = getMessages(locale);
  return {
    title: t.meta.resetTitle,
    description: t.meta.resetDescription,
  };
}

export default async function LocaleResetPasswordPage({
  params,
}: LocaleResetPasswordPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  return <ResetPasswordForm locale={locale} />;
}
