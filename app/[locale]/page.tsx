import { redirect } from "next/navigation";

import { isLocale } from "@/lib/i18n";

type LocaleRootPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleRootPage({ params }: LocaleRootPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    redirect("/vi/select-platform");
  }

  redirect(`/${locale}/select-platform`);
}
