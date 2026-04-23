import { notFound, redirect } from "next/navigation";

import { isLocale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string; storeId: string }>;
};

export default async function StoreSettingsIndexPage({ params }: PageProps) {
  const { locale, storeId } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  redirect(`/${locale}/store/${storeId}/hours`);
}
