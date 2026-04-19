/** Các route con dưới `/{locale}/dashboard` (nhóm layout shell). */
export const DASHBOARD_MAIN_NAV = [
  { id: "overview" as const, segment: "" },
  { id: "store" as const, segment: "store" },
  { id: "user" as const, segment: "user" },
  { id: "conversation" as const, segment: "conversation" },
] as const;

export type DashboardMainNavId = (typeof DASHBOARD_MAIN_NAV)[number]["id"];

export function dashboardNavHref(locale: string, segment: string): string {
  const base = `/${locale}/dashboard`;
  return segment ? `${base}/${segment}` : base;
}
