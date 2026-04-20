"use client";

import { useTheme } from "@/hooks/use-theme";

type ThemeSwitcherProps = {
  lightLabel: string;
  darkLabel: string;
};

export function ThemeSwitcher({ lightLabel, darkLabel }: ThemeSwitcherProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <button type="button" className="theme-switcher-skeleton" disabled aria-hidden />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-switcher"
      title={theme === "light" ? darkLabel : lightLabel}
      aria-label={theme === "light" ? darkLabel : lightLabel}
    >
      <span className="text-sm" aria-hidden>
        {theme === "light" ? "🌙" : "☀️"}
      </span>
      <span className="hidden sm:inline">{theme === "light" ? darkLabel : lightLabel}</span>
    </button>
  );
}