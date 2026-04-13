"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

import { AuthShell } from "@/components/auth-shell";
import { persistAuthTokens } from "@/lib/auth-tokens";
import { getMessages, Locale } from "@/lib/i18n";

type LoginFormProps = {
  locale: Locale;
};

export function LoginForm({ locale }: LoginFormProps) {
  const router = useRouter();
  const t = getMessages(locale);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Mock token generation for local development flow.
    persistAuthTokens({
      accessToken: `mock_access_${crypto.randomUUID()}`,
      refreshToken: `mock_refresh_${crypto.randomUUID()}`,
    });

    router.push(`/${locale}/select-platform`);
  }

  return (
    <AuthShell
      locale={locale}
      title={t.auth.login.title}
      description={t.auth.login.description}
      footer={
        <p>
          {t.auth.login.noAccount}{" "}
          <Link href={`/${locale}/register`} className="font-medium text-sky-700">
            {t.auth.login.createAccount}
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
          <span className="text-slate-700">{t.auth.fields.password}</span>
          <input
            required
            type="password"
            placeholder="********"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-sky-500 focus:ring"
          />
        </label>
        <div className="flex justify-end">
          <Link
            href={`/${locale}/reset-password`}
            className="text-sm font-medium text-sky-700"
          >
            {t.auth.login.forgotPassword}
          </Link>
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-sky-600 px-4 py-2.5 font-medium text-white transition hover:bg-sky-700"
        >
          {t.auth.login.submit}
        </button>
      </form>
    </AuthShell>
  );
}
