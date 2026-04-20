import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StoreCourseFormClient } from "@/components/platform/store-course-form-client";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string; storeId: string; courseId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }
  const t = getMessages(locale);
  return {
    title: `${t.store.course.formEditTitle} | ${t.store.settings.pageTitle} | ${t.meta.appTitle}`,
    description: t.meta.dashboardDescription,
  };
}

export default async function StoreCourseEditPage({ params }: PageProps) {
  const { locale, courseId } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  return <StoreCourseFormClient locale={locale as Locale} mode="edit" courseId={courseId} />;
}
