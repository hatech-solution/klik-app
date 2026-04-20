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
      className="logout-button"
    >
      {label}
    </button>
  );
}
