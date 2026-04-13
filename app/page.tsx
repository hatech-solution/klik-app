import { redirect } from "next/navigation";
import { getServerLocale } from "@/lib/i18n-server";

export default async function Home() {
  const locale = await getServerLocale();
  redirect(`/${locale}/login`);
}
