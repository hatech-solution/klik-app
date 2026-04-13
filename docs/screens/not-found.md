# Screen: Not Found

## Route

- Global fallback: `app/not-found.tsx`
- Locale fallback: `app/[locale]/not-found.tsx`

## Mục tiêu

- Hiển thị thông báo 404 theo locale hiện tại.
- Cung cấp đường dẫn quay về login theo locale.

## Thành phần chính

- `app/not-found.tsx`
- `app/[locale]/not-found.tsx`

## Input/Output flow

- Input:
  - User truy cập route không hợp lệ
- Output:
  - UI 404
  - CTA quay về `/{locale}/login`

## State

- Không có state client.
- Locale resolve theo param/cookie/header tùy context.
