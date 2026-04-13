"use client";

import Link from "next/link";
import { ReactNode } from "react";

import { Locale } from "@/lib/i18n";

type AuthShellProps = {
  locale: Locale;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthShell({
  locale,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link
          href={`/${locale}/login`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500"
        >
          <span className="text-base">💬</span>
          Nano Message Support
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        <div className="mt-6 space-y-4">{children}</div>
        <div className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-600">
          {footer}
        </div>
      </div>
    </main>
  );
}
