# Routing Technical Flow (Locale + Subdomain)

```mermaid
flowchart TD
    A["Incoming Request"] --> B{"Path starts with /_next, /api, /favicon.ico?"}
    B -- Yes --> Z["NextResponse.next()"]
    B -- No --> C["Read host + pathname"]

    C --> D["Extract locale from path (if any)"]
    D --> E["Resolve preferred locale"]
    E --> E1["cookie lang ? cookie : Accept-Language"]

    C --> F{"Host is platform subdomain?"}

    F -- No --> G{"Path has locale prefix?"}
    G -- No --> H["Redirect to /{preferredLocale}{pathname}"]
    G -- Yes --> Z

    F -- Yes --> I{"Path is '/' and no locale?"}
    I -- Yes --> J["Redirect to /{preferredLocale}"]
    I -- No --> K{"Path is locale root? /{locale}"}
    K -- Yes --> L["Rewrite to /{locale}/platform/{platform}"]
    K -- No --> Z
```

## Source of truth

- Runtime entry: `proxy.ts`
- Locale helpers: `lib/i18n.ts`, `lib/i18n-server.ts`
- Subdomain helpers: `lib/domain.ts`

## Notes for AI agents

- Đừng thay đổi thứ tự redirect/rewrite nếu không có lý do rõ ràng.
- Mọi URL public nên ưu tiên dạng `/{locale}/...`.
- Subdomain platform phải giữ được locale trên path.
