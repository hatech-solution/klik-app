---
name: nano-message-support-onboarding
description: Onboards agents to the Nano Message Support codebase and enforces safe edits for wildcard subdomain routing, locale-prefixed routes, i18n vi/en, and platform dashboard flow. Use when implementing features, refactoring UI, or updating routing/i18n in this project.
---
# Nano Message Support Onboarding

## Quick start

1. Read `AGENTS.md`.
2. Read `docs/ai/00-quickstart.md`.
3. Read `docs/screens/README.md` if the task maps to specific screens.
4. If task touches routing/i18n, read the matching doc in `docs/ai/`.

## Project invariants

- Keep flow: `/{locale}/login -> /{locale}/select-platform -> subdomain -> dashboard`.
- Keep wildcard subdomain rewrite behavior in `proxy.ts`.
- Keep locale bound to router (`/{locale}/...`).
- Use `yarn` for all install/build/lint commands.
- UI text must come from i18n dictionary (`lib/i18n.ts`) with both `vi` and `en`.

## Key files to inspect by task type

- Routing/subdomain:
  - `proxy.ts`
  - `lib/domain.ts`
  - `lib/platforms.ts`
- i18n:
  - `lib/i18n.ts`
  - `lib/i18n-server.ts`
  - `components/language-switcher.tsx`
  - `components/app-header.tsx`
- UI flow:
  - `app/[locale]/select-platform/page.tsx`
  - `app/[locale]/platform/[platform]/page.tsx`
  - `components/platform/platform-dashboard.tsx`

## Editing workflow

1. Identify impacted invariant(s).
2. Implement minimal safe change.
3. Run `yarn lint`.
4. Run `yarn build` if routing/runtime/UI flow changed.
5. Verify language switch and platform flow manually.

## Done checklist

- [ ] No lint errors.
- [ ] Build passes (if required).
- [ ] Subdomain routing still works.
- [ ] Header language select works.
- [ ] New text has `vi/en`.

## References

- [AI docs index](../../docs/README.md)
- [Screen docs index](../../docs/screens/README.md)
- [Agent standard](../../docs/ai/05-agent-editing-standard.md)
