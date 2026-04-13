# Reference - Nano Message Support Skill

## Directory map (high signal)

- `app/` - routes (locale-prefixed auth, select-platform, platform dynamic page)
- `components/` - shared UI + dashboard UI
- `lib/` - platform config, domain helpers, i18n, mock data
- `proxy.ts` - wildcard subdomain rewrite

## Known constraints

- Current data layer is mock; no real backend persistence.
- Bot selection is client session storage by platform key.
- Platform theme differs by color/logo but layout stays consistent.

## Typical change recipes

### Add new UI text

1. Add keys to `lib/i18n.ts` for both locales.
2. Read from `getMessages(locale)` in component/page.
3. Verify with language select on header.

### Add new platform (mock)

1. Extend `PlatformId` and configs in `lib/platforms.ts`.
2. Add i18n platform text in dictionary.
3. Ensure select-platform UI and dashboard path handle new id.
4. Verify rewrite behavior for new subdomain pattern.

### Update dashboard sections

1. Update mock section data source.
2. Keep menu-left + content-right layout pattern.
3. Do not break bot selection/session behavior.
