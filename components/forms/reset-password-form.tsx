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
          <Link href={`/${locale}/login`} className="dm-link-accent">
            {t.auth.reset.login}
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-1 text-sm">
          <span className="dm-label">{t.auth.fields.email}</span>
          <input
            required
            type="email"
            placeholder="you@company.com"
            className="dm-input"
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
        <p className="dm-alert-success mt-4">{t.auth.reset.success}</p>
      ) : null}
    </AuthShell>
  );
}
