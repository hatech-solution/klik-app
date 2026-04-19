# UI, State & Flow

## Auth UI

- `components/auth-shell.tsx` dùng layout chung cho login/register/reset-password.
- Form components:
  - `components/forms/login-form.tsx`
  - `components/forms/register-form.tsx`
  - `components/forms/reset-password-form.tsx`

## Platform selection

- `app/[locale]/select-platform/page.tsx` render client view để gọi `GET /api/v1/platforms`.
- Dữ liệu API được map qua `mapApiPlatformsToConfigs` (`lib/platforms.ts`).

## Platform dashboard

- `components/platform/platform-dashboard.tsx` là màn hình chính sau khi vào subdomain.
- Chức năng:
  - chọn bot
  - tạo/sửa/tắt bot qua API (`lib/api/bot/client.ts`)
  - menu trái mock 3 phân hệ
- Phản hồi sau API (toast Sonner, modal xác nhận xóa store, map lỗi store): xem `docs/ai/06-toast-confirm-feedback.md`.
- Skeleton khi client chờ API (layout, a11y, thứ tự triển khai): xem `docs/ai/07-client-loading-skeletons.md`.

## Session state

- `bot_id` lưu ở `localStorage` key `bot_id`.
- Thay đổi state không được làm mất tính tách biệt giữa các platform.
