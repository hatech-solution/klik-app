import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n";

type DashboardRedirectPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardRedirectPage({ params }: DashboardRedirectPageProps) {
  const { locale } = await params;
  
  if (!isLocale(locale)) {
    notFound();
  }
  
  // Redirect tới overview vì dashboard cũ giờ thành overview
  redirect(`/${locale}/overview`);
}