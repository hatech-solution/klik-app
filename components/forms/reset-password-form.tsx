"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { AuthShell } from "@/components/auth-shell";
import { getMessages, Locale } from "@/lib/i18n";

type ResetPasswordFormProps = {
  locale: Locale;
};

export function ResetPasswordForm({ locale }: ResetPasswordFormProps) {
  const [sent, setSent] = useState(false);
  const t = getMessages(locale);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <AuthShell
      locale={locale}
      title={t.auth.reset.title}
      description={t.auth.reset.description}
      footer={
        <p>
          {t.auth.reset.backToLogin}{" "}
          <Link href={`/${locale}/login`} className="font-medium text-sky-700">
            {t.auth.reset.login}
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
        <button
          type="submit"
          className="w-full rounded-lg bg-sky-600 px-4 py-2.5 font-medium text-white transition hover:bg-sky-700"
        >
          {t.auth.reset.submit}
        </button>
      </form>
      {sent ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {t.auth.reset.success}
        </p>
      ) : null}
    </AuthShell>
  );
}
