/** Các route navigation chính - tất cả đều cùng cấp, độc lập. */
export const DASHBOARD_MAIN_NAV = [
  { id: "overview" as const, segment: "overview" },
  { id: "store" as const, segment: "store" },
  { id: "user" as const, segment: "user" },
  { id: "conversation" as const, segment: "conversation" },
] as const;

export type DashboardMainNavId = (typeof DASHBOARD_MAIN_NAV)[number]["id"];

export function dashboardNavHref(locale: string, segment: string): string {
  // Tất cả route đều cùng cấp, độc lập
  return `/${locale}/${segment}`;
}
