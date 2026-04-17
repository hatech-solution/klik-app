"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { AuthShell } from "@/components/auth-shell";
import { persistAuthTokens } from "@/lib/auth-tokens";
import { registerWithApi } from "@/lib/auth-api";
import { getMessages, Locale } from "@/lib/i18n";

type RegisterFormProps = {
  locale: Locale;
};

export function RegisterForm({ locale }: RegisterFormProps) {
  const router = useRouter();
  const t = getMessages(locale);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setIsSubmitting(true);
    try {
      const tokens = await registerWithApi({ name, email, password });
      persistAuthTokens(tokens);
      router.push(`/${locale}/select-platform`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t.auth.common.defaultError;
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
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
        {errorMessage ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorMessage}
          </p>
        ) : null}
        <label className="block space-y-1 text-sm">
          <span className="text-slate-700">{t.auth.fields.email}</span>
          <input
            name="email"
            required
            type="email"
            placeholder="you@company.com"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-sky-500 focus:ring"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-slate-700">{t.auth.fields.phone}</span>
          <input
            name="phone"
            type="tel"
            placeholder="0901234567"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-sky-500 focus:ring"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-slate-700">{t.auth.fields.displayName}</span>
          <input
            name="name"
            required
            type="text"
            placeholder="Nguyen Van A"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-sky-500 focus:ring"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-slate-700">{t.auth.fields.password}</span>
          <input
            name="password"
            required
            type="password"
            placeholder="********"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-sky-500 focus:ring"
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-sky-600 px-4 py-2.5 font-medium text-white transition hover:bg-sky-700"
        >
          {isSubmitting ? t.auth.common.submitting : t.auth.register.submit}
        </button>
      </form>
    </AuthShell>
  );
}
