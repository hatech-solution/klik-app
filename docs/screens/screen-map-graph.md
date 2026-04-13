# Screen Flow Graph

```mermaid
flowchart TD
    A["/ (root)"] --> B["/{locale}/login"]
    B --> C["/{locale}/select-platform"]
    B --> D["/{locale}/register"]
    B --> E["/{locale}/reset-password"]
    D --> B
    E --> B

    C --> L["line.<domain>/{locale}"]
    C --> Z["zalo.<domain>/{locale}"]
    C --> T["telegram.<domain>/{locale}"]
    C --> I["instagram.<domain>/{locale}"]

    L --> P["rewrite -> /{locale}/platform/line"]
    Z --> Q["rewrite -> /{locale}/platform/zalo"]
    T --> R["rewrite -> /{locale}/platform/telegram"]
    I --> S["rewrite -> /{locale}/platform/instagram"]

    P --> U["Platform Dashboard"]
    Q --> U
    R --> U
    S --> U

    U --> V["Chọn bot ở header"]
    U --> W["Nếu chưa có bot -> form tạo bot"]
    V --> X["Admin menu: store / user / conversation"]

    Y["Language select (header)"] --> B
    Y --> C
    Y --> U
    Y --> N["Route locale switch: /vi/... <-> /en/..."]
```

## Ghi chú nhanh

- Flow subdomain được xử lý ở `proxy.ts`.
- Locale được bind trên router (`/{locale}/...`) và đổi bằng dropdown header.
- Dashboard dùng chung layout, chỉ đổi theme/logo theo platform.
