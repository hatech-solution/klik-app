# AI Quickstart (60s)

## Mục tiêu

- App Next.js quản trị bot đa platform (LINE, Zalo, Telegram, Instagram).
- Flow chính: `login` -> `select-platform` -> vào subdomain platform -> dashboard.

## File quan trọng cần nhớ

- Wildcard subdomain rewrite: `proxy.ts`
- Locale + dictionary:
  - `lib/i18n.ts`
  - `lib/i18n-server.ts`
- Header global + language select + theme:
  - `components/app-header.tsx`
  - `components/language-switcher.tsx`
  - `components/theme-switcher.tsx`
- Dashboard theo platform: `components/platform/platform-dashboard.tsx`
- API clients chính:
  - `lib/api/auth/`
  - `lib/api/platform/`
  - `lib/api/bot/`
  - `lib/api/store/`
- Toast + modal xác nhận + lỗi store: `docs/ai/06-toast-confirm-feedback.md`
- Dark mode + theme system: `docs/ai/08-dark-mode.md`
- Shared domain types:
  - `lib/types/bot.ts`
  - `lib/types/store.ts`

## Nguyên tắc bắt buộc

- Dùng `yarn` (`yarn lint`, `yarn build`).
- Text mới phải thêm đủ `vi/en` trong dictionary.
- Không phá flow subdomain và không hardcode text mới ngoài i18n.
