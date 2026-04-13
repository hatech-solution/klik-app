# i18n & SEO Guide

## i18n sources

- Dictionary: `lib/i18n.ts`
- Server locale resolver: `lib/i18n-server.ts`
- Language switcher: `components/language-switcher.tsx`
- Global header mount: `components/app-header.tsx`, `app/layout.tsx`

## Thứ tự chọn ngôn ngữ

1. Cookie `lang` (khi user chọn thủ công từ dropdown)
2. `Accept-Language` từ máy/trình duyệt user

## Quy tắc thêm nội dung mới

- Mỗi key mới phải có đủ `vi` và `en`.
- Không hardcode text hiển thị trực tiếp trong component nếu đó là text nghiệp vụ/UI.

## SEO

- Metadata global ở `app/layout.tsx`.
- Metadata từng page qua `generateMetadata`.
- Khi thêm page mới, luôn thêm title/description theo locale.
