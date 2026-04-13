# Screen: Select Platform

## Route

- `/{locale}/select-platform`

## Mục tiêu

- Cho user chọn nền tảng để đi vào subdomain tương ứng.
- Giữ locale trên URL khi chuyển domain.

## Thành phần chính

- Page: `app/[locale]/select-platform/page.tsx`
- Card: `components/platform/platform-card.tsx`
- Data config: `lib/platforms.ts`
- URL helper: `lib/domain.ts` (`buildPlatformUrl`)

## Input/Output flow

- Input:
  - Click card platform (`line`, `zalo`, `telegram`, `instagram`)
- Output:
  - Điều hướng sang subdomain:
    - `https://line.<root-domain>/{locale}`
    - `https://zalo.<root-domain>/{locale}`
    - ...

## State

- Không có state client persistent.
- Render dựa trên platform config và host hiện tại.

## Điểm dễ vỡ

- Không được làm mất `/{locale}` khi build link subdomain.
- Nếu thêm platform mới:
  - update `lib/platforms.ts`
  - update i18n text mô tả platform
  - verify rewrite subdomain trong `proxy.ts`
