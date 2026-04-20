import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ locale: string; storeId: string }>;
};

export default async function StoreCourseNewPage({ params }: PageProps) {
  const { locale, storeId } = await params;
  redirect(`/${locale}/stores/${storeId}/settings/courses/new`);
}
