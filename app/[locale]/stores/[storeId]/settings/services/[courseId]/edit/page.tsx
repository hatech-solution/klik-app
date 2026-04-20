import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ locale: string; storeId: string; courseId: string }>;
};

export default async function StoreCourseEditPage({ params }: PageProps) {
  const { locale, storeId, courseId } = await params;
  redirect(`/${locale}/stores/${storeId}/settings/courses/${courseId}/edit`);
}
