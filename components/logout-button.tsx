"use client";

import { usePathname, useRouter } from "next/navigation";

import { clearAuthTokens } from "@/lib/auth-tokens";
import { Locale } from "@/lib/i18n";

type LogoutButtonProps = {
  locale: Locale;
  label: string;
};

const HIDE_LOGOUT_ROUTE_PATTERNS: RegExp[] = [
  // Auth screens.
  /^\/[^/]+\/login$/,
  /^\/[^/]+\/register$/,
  /^\/[^/]+\/reset-password$/,
  // Public/user-side platform screens.
  /^\/[^/]+\/store\/[^/]+\/booking$/,
];

function shouldHideLogout(pathname: string): boolean {
  return HIDE_LOGOUT_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}

export function LogoutButton({ locale, label }: LogoutButtonProps) {
  const pathname = usePathname();
  const router = useRouter();

  if (shouldHideLogout(pathname)) {
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
