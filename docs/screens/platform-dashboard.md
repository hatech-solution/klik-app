# Screen: Platform Dashboard

## Route

- Public URL: `https://<platform>.<domain>/{locale}`
- Internal rewrite target: `/{locale}/platform/[platform]`

## Mục tiêu

- Hiển thị dashboard admin theo từng platform với:
  - màu/logo theo platform
  - layout nhất quán
  - chọn bot
  - mock 3 module quản trị

## Thành phần chính

- Page: `app/[locale]/platform/[platform]/page.tsx`
- Dashboard UI: `components/platform/platform-dashboard.tsx`
- Mock data:
  - `lib/mock-data.ts`
  - `lib/platforms.ts`

## Input/Output flow

- Input:
  - User vào subdomain platform
  - Chọn bot ở header dropdown
  - Nếu chưa có bot, tạo bot mới qua form
  - Chọn menu trái (store/user/conversation)
- Output:
  - Hiển thị nội dung module đang active
  - Persist bot đã chọn trong session storage theo platform key

## State

- Local state chính:
  - `bots`
  - `selectedBotId`
  - `newBotName`
  - `activeSection`
- Session storage:
  - key dạng `selected_bot_id_<platform>`

## Điểm dễ vỡ

- Không trộn bot selection giữa các platform.
- Không đổi layout theo platform (chỉ đổi theme/logo).
- Không hardcode text mới ngoài i18n.
