"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { AuthShell } from "@/components/auth-shell";
import { loginWithApi } from "@/lib/api/auth";
import { getErrorMessageByKey } from "@/lib/api/error";
import { persistAuthTokens } from "@/lib/auth-tokens";
import { getMessages, Locale } from "@/lib/i18n";

type LoginFormProps = {
  locale: Locale;
};

export function LoginForm({ locale }: LoginFormProps) {
  const router = useRouter();
  const t = getMessages(locale);
  const authErrorByKey = t.auth.errorByKey as Record<string, string>;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setIsSubmitting(true);
    try {
      const tokens = await loginWithApi({ email, password });
      persistAuthTokens(tokens);
      router.push(`/${locale}/select-platform`);
    } catch (error) {
      setErrorMessage(getErrorMessageByKey(error, t.auth.common.defaultError, authErrorByKey));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      locale={locale}
      title={t.auth.login.title}
      description={t.auth.login.description}
      footer={
        <p>
          {t.auth.login.noAccount}{" "}
          <Link href={`/${locale}/register`} className="dm-link-accent">
            {t.auth.login.createAccount}
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {errorMessage ? (
          <p className="dm-alert-error dm-alert-tight">{errorMessage}</p>
        ) : null}
        <label className="block space-y-1 text-sm">
          <span className="dm-label">{t.auth.fields.email}</span>
          <input
            name="email"
            required
            type="email"
            placeholder="you@company.com"
            className="dm-input"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="dm-label">{t.auth.fields.password}</span>
          <input
            name="password"
            required
            type="password"
            placeholder="********"
            className="dm-input"
          />
        </label>
        <div className="flex justify-end">
          <Link
            href={`/${locale}/reset-password`}
            className="dm-link-accent text-sm"
          >
            {t.auth.login.forgotPassword}
          </Link>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-sky-600 px-4 py-2.5 font-medium text-white transition hover:bg-sky-700"
        >
          {isSubmitting ? t.auth.common.submitting : t.auth.login.submit}
        </button>
      </form>
    </AuthShell>
  );
}
