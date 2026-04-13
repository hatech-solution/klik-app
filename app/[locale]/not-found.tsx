import Link from "next/link";

import { getMessages, isLocale } from "@/lib/i18n";

type LocaleNotFoundProps = {
  params?: Promise<{ locale?: string }>;
};

export default async function LocaleNotFound({ params }: LocaleNotFoundProps) {
  const locale = (await params)?.locale;
  const resolvedLocale = isLocale(locale) ? locale : "vi";
  const t = getMessages(resolvedLocale);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{t.notFound.title}</h1>
        <p className="mt-3 text-slate-600">{t.notFound.description}</p>
        <Link
          href={`/${resolvedLocale}/login`}
          className="mt-6 inline-flex rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
        >
          {t.notFound.backToLogin}
        </Link>
      </div>
    </main>
  );
}
