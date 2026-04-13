"use client";

import { usePathname, useRouter } from "next/navigation";

import { clearAuthTokens } from "@/lib/auth-tokens";
import { Locale } from "@/lib/i18n";

type LogoutButtonProps = {
  locale: Locale;
  label: string;
};

export function LogoutButton({ locale, label }: LogoutButtonProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isAuthScreen =
    pathname.endsWith("/login") ||
    pathname.endsWith("/register") ||
    pathname.endsWith("/reset-password");

  if (isAuthScreen) {
    return null;
  }

  function handleLogout() {
    clearAuthTokens();
    router.replace(`/${locale}/login`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
    >
      {label}
    </button>
  );
}
