# Screen: Reset Password

## Route

- `/{locale}/reset-password`

## Mục tiêu

- Nhận email để gửi hướng dẫn reset mật khẩu (mock).

## Thành phần chính

- Page: `app/[locale]/reset-password/page.tsx`
- Form: `components/forms/reset-password-form.tsx`
- Shell: `components/auth-shell.tsx`

## Input/Output flow

- Input:
  - Email
- Output:
  - Submit -> hiển thị thông báo đã gửi email (mock)
  - Link phụ -> quay lại `/{locale}/login`

## State

- Local state:
  - `sent: boolean` để điều khiển thông báo thành công.

## i18n

- Dùng key nhóm:
  - `auth.reset.*`
  - `auth.fields.email`
  - `meta.reset*`
