# UI, State & Flow

## Auth UI

- `components/auth-shell.tsx` dùng layout chung cho login/register/reset-password.
- Form components:
  - `components/forms/login-form.tsx`
  - `components/forms/register-form.tsx`
  - `components/forms/reset-password-form.tsx`

## Platform selection

- `app/select-platform/page.tsx` hiển thị card platform.
- Chọn platform tạo link subdomain qua helper domain.

## Platform dashboard

- `components/platform/platform-dashboard.tsx` là màn hình chính sau khi vào subdomain.
- Chức năng:
  - chọn bot
  - tạo bot khi chưa có bot
  - menu trái mock 3 phân hệ

## Session state

- `bot_id` hiện lưu ở session storage theo key có suffix platform.
- Thay đổi state không được làm mất tính tách biệt giữa các platform.
