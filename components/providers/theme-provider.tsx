"use client";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // ThemeProvider giờ chỉ wrap children
  // Theme logic được handle bởi useTheme hook
  return <>{children}</>;
}