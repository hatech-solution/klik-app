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
      <div className="dm-auth-shell-inner w-full max-w-md">
        <Link href={`/${locale}/login`} className="dm-auth-brand">
          <span className="text-base">💬</span>
          Klik
        </Link>
        <h1 className="dm-auth-title">{title}</h1>
        <p className="dm-auth-desc">{description}</p>
        <div className="mt-6 space-y-4">{children}</div>
        <div className="dm-auth-footer">{footer}</div>
      </div>
    </main>
  );
}
