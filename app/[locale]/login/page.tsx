import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LoginForm } from "@/components/forms/login-form";
import { getMessages, isLocale } from "@/lib/i18n";

type LocaleLoginPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LocaleLoginPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const t = getMessages(locale);
  return {
    title: t.meta.loginTitle,
    description: t.meta.loginDescription,
  };
}

export default async function LocaleLoginPage({ params }: LocaleLoginPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  return <LoginForm locale={locale} />;
}
