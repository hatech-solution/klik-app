# Screen Map (Quick Scan)

| Screen | Route | Main Page/File | Main UI Component | State Keys | i18n Keys | Notes |
|---|---|---|---|---|---|---|
| Login | `/{locale}/login` | `app/[locale]/login/page.tsx` | `components/forms/login-form.tsx` | none | `meta.login*`, `auth.login.*`, `auth.fields.*` | Submit -> `/{locale}/select-platform` |
| Register | `/{locale}/register` | `app/[locale]/register/page.tsx` | `components/forms/register-form.tsx` | none | `meta.register*`, `auth.register.*`, `auth.fields.*` | Submit mock -> `/{locale}/login` |
| Reset Password | `/{locale}/reset-password` | `app/[locale]/reset-password/page.tsx` | `components/forms/reset-password-form.tsx` | `sent` | `meta.reset*`, `auth.reset.*`, `auth.fields.email` | Show success message after submit |
| Select Platform | `/{locale}/select-platform` | `app/[locale]/select-platform/page.tsx` | `components/platform/platform-card.tsx` | none | `meta.select*`, `selectPlatform.*` | Build subdomain URL with locale path |
| Platform Dashboard | `/{locale}/platform/[platform]` (rewrite from subdomain) | `app/[locale]/platform/[platform]/page.tsx` | `components/platform/platform-dashboard.tsx` | `bots`, `selectedBotId`, `newBotName`, `activeSection` | `meta.platform*`, `dashboard.*` | `selectedBotId` persisted in session storage per platform |
| Not Found | `not-found` fallback | `app/not-found.tsx`, `app/[locale]/not-found.tsx` | inline | none | `notFound.*` | CTA back to `/{locale}/login` |

## Shared Layout/Infra

| Area | File | Purpose |
|---|---|---|
| Global app shell | `app/layout.tsx` | Root HTML layout |
| Locale shell | `app/[locale]/layout.tsx` | Header mount + locale validation |
| Header | `components/app-header.tsx` | Brand + language dropdown |
| Language switch | `components/language-switcher.tsx` | Update locale segment in router + cookie |
| Subdomain rewrite | `proxy.ts` | Wildcard platform host -> locale platform route |
| i18n dictionary | `lib/i18n.ts` | All locale texts and helpers |
| Server locale resolve | `lib/i18n-server.ts` | Cookie `lang` then `Accept-Language` |
