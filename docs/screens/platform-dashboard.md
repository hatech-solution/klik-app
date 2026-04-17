# Screen: Platform Dashboard

## Route

- Public URL: `https://<platform>.<domain>/{locale}/dashboard`
- Internal route: `/{locale}/dashboard` (platform lấy từ `platform_id` trong client storage)

## Mục tiêu

- Hiển thị dashboard admin theo từng platform với:
  - màu/logo theo platform
  - layout nhất quán
  - chọn bot
  - gọi API bot thật (list/create/update/deactivate)
  - module store gọi API thật (`lib/api/store/client.ts`); user/conversation vẫn mock UI

## Thành phần chính

- Page: `app/[locale]/dashboard/page.tsx`
- Dashboard UI: `components/platform/platform-dashboard.tsx`
- API clients:
  - `lib/api/bot/client.ts`
  - `lib/api/bot/mapper.ts`
  - `lib/api/bot/types.ts`
  - `lib/api/store/client.ts`, `lib/api/store/types.ts`, `lib/api/store/form-field-errors.ts`
- Shared types/constants:
  - `lib/types/bot.ts`
  - `lib/constants/dashboard-sections.ts`
- Toast toàn app: `lib/toast.ts` + `components/providers/app-toaster.tsx` (Sonner).
- Modal xác nhận tái sử dụng: `components/common/confirm-modal.tsx` (xóa store).

## Input/Output flow

- Input:
  - User vào subdomain platform và chọn bot
  - Chọn bot ở header dropdown
  - Nếu chưa có bot, tạo bot mới qua form (POST `/api/v1/bots`, kèm header `X-Platform-Id`)
  - Sửa bot (PUT `/api/v1/bots/:id`)
  - Tắt bot (PATCH `/api/v1/bots/:id/deactivate`)
  - Chọn menu trái (store/user/conversation)
  - Store: CRUD qua `GET/POST/PUT/DELETE /api/v1/stores` với header `X-Bot-Id`; lỗi validate map theo `message_key` / `field_errors`
- Output:
  - Hiển thị nội dung module đang active
  - Persist bot đã chọn trong `localStorage` key `bot_id`
  - Toast success/error cho thao tác bot và store (theo quy ước trong `docs/ai/06-toast-confirm-feedback.md`)

## State

- Local state chính:
  - `bots`
  - `selectedBotId`
  - `newBotName`
  - `activeSection`
- Client storage:
  - `platform_id` trong `localStorage` (zustand store)
  - `bot_id` trong `localStorage`

## Điểm dễ vỡ

- Không trộn bot selection giữa các platform.
- Không đổi layout theo platform (chỉ đổi theme/logo).
- Không hardcode text mới ngoài i18n.
- Request bot API phải luôn có `Authorization` token hợp lệ.
