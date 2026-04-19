import { redirect } from "next/navigation";

import { isLocale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string; storeId: string }>;
};

/** URL cũ → cài đặt cửa hàng (SPEC §1–§4). */
export default async function StoreOperatingHoursRedirectPage({ params }: PageProps) {
  const { locale, storeId } = await params;
  if (!isLocale(locale)) {
    redirect("/");
  }
  redirect(`/${locale}/dashboard/stores/${storeId}/settings/hours`);
}
