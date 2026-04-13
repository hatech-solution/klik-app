import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { buildMainAppUrl } from "@/lib/domain";
import { isLocale } from "@/lib/i18n";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const headerStore = await headers();
  const host = headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const homeHref = buildMainAppUrl(host, protocol, `/${locale}`);

  return (
    <div className="min-h-screen">
      <AppHeader locale={locale} homeHref={homeHref} />
      <div>{children}</div>
    </div>
  );
}
