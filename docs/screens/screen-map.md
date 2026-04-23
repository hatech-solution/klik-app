# Screen Map (Quick Scan)

| Screen | Route | Main Page/File | Main UI Component | State Keys | i18n Keys | Notes |
|---|---|---|---|---|---|---|
| Login | `/{locale}/login` | `app/[locale]/login/page.tsx` | `components/forms/login-form.tsx` | none | `meta.login*`, `auth.login.*`, `auth.fields.*` | Submit -> `/{locale}/select-platform` |
| Register | `/{locale}/register` | `app/[locale]/register/page.tsx` | `components/forms/register-form.tsx` | none | `meta.register*`, `auth.register.*`, `auth.fields.*` | Submit mock -> `/{locale}/login` |
| Reset Password | `/{locale}/reset-password` | `app/[locale]/reset-password/page.tsx` | `components/forms/reset-password-form.tsx` | `sent` | `meta.reset*`, `auth.reset.*`, `auth.fields.email` | Show success message after submit |
| Select Platform | `/{locale}/select-platform` | `app/[locale]/select-platform/page.tsx` | `components/platform/platform-card.tsx` | none | `meta.select*`, `selectPlatform.*` | Build subdomain URL with locale path |
| Platform Overview | `https://<platform>.<domain>/{locale}/overview` → `/{locale}/overview` | `app/[locale]/overview/page.tsx` | `components/platform/dashboard-overview.tsx` | `bots`, `selectedBotId`, `newBotName`, `activeSection`, `botsListReady` | `meta.platform*`, `dashboard.*`, `toast.*` | `platform_id` zustand + `localStorage` `bot_id`; validate bot chỉ sau `botsListReady` |
| Store Management | `/{locale}/store` | `app/[locale]/store/page.tsx` | `components/platform/store-management.tsx` | `stores`, `regions`, `regionsLoading`, `regionCode`, `timezone`, `currencyCode`, `showModal`, `fieldErrors`, `deleteTargetId`, … | `store.*`, `store.errorByKey`, `toast.store*`, `toast.loadRegionsFailed`, `common.confirmModal.*` | Bot cho stores: `X-Bot-Id`. `GET /api/v1/regions` không cần bot. CRUD + field booking: `lib/api/store/client.ts`. Cột hành động: **Quản lý** → Store Hub |
| Store Hub (dashboard cửa hàng) | `/{locale}/store/[storeId]` | `app/[locale]/store/[storeId]/page.tsx` (dự kiến) | `components/platform/store-dashboard-hub.tsx` (gợi ý) | `store`, `stats`, `loading`, `error` | `storeDashboard.*` hoặc mở rộng `store.*` | Layout `store/layout.tsx` + `DashboardShell`. Module: thống kê, giờ, staff, public booking, bookings — mỗi module có route setting con; xem `docs/screens/store-dashboard.md` |
| Not Found | `not-found` fallback | `app/not-found.tsx`, `app/[locale]/not-found.tsx` | inline | none | `notFound.*` | CTA back to `/{locale}/login` |

## Shared Layout/Infra

| Area | File | Purpose |
|---|---|---|
| Global app shell | `app/layout.tsx` | Root HTML layout |
| Locale shell | `app/[locale]/layout.tsx` | Header mount + locale validation |
| Header | `components/app-header.tsx` | Brand + language dropdown + theme switcher |
| Language switch | `components/language-switcher.tsx` | Update locale segment in router + cookie |
| Theme switch | `components/theme-switcher.tsx` | Dark/light mode toggle + localStorage |
| Subdomain rewrite | `proxy.ts` | Wildcard platform host -> locale platform route |
| i18n dictionary | `lib/i18n.ts` | All locale texts and helpers |
| Server locale resolve | `lib/i18n-server.ts` | Cookie `lang` then `Accept-Language` |
