"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

import { AuthShell } from "@/components/auth-shell";
import { getMessages, Locale } from "@/lib/i18n";

type RegisterFormProps = {
  locale: Locale;
};

export function RegisterForm({ locale }: RegisterFormProps) {
  const router = useRouter();
  const t = getMessages(locale);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(`/${locale}/login`);
  }

  return (
    <AuthShell
      locale={locale}
      title={t.auth.register.title}
      description={t.auth.register.description}
      footer={
        <p>
          {t.auth.register.hasAccount}{" "}
          <Link href={`/${locale}/login`} className="font-medium text-sky-700">
            {t.auth.register.login}
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-1 text-sm">
          <span className="text-slate-700">{t.auth.fields.email}</span>
          <input
            required
            type="email"
            placeholder="you@company.com"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-sky-500 focus:ring"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-slate-700">{t.auth.fields.phone}</span>
          <input
            required
            type="tel"
            placeholder="0901234567"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-sky-500 focus:ring"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-slate-700">{t.auth.fields.displayName}</span>
          <input
            required
            type="text"
            placeholder="Nguyen Van A"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-sky-500 focus:ring"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-slate-700">{t.auth.fields.password}</span>
          <input
            required
            type="password"
            placeholder="********"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-sky-500 focus:ring"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-sky-600 px-4 py-2.5 font-medium text-white transition hover:bg-sky-700"
        >
          {t.auth.register.submit}
        </button>
      </form>
    </AuthShell>
  );
}
