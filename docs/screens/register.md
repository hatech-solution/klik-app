# Screen: Register

## Route

- `/{locale}/register`

## Mục tiêu

- Thu thập thông tin đăng ký tài khoản quản trị:
  - email
  - phone
  - name
  - password

## Thành phần chính

- Page: `app/[locale]/register/page.tsx`
- Form: `components/forms/register-form.tsx`
- Shell: `components/auth-shell.tsx`

## Input/Output flow

- Input:
  - Email
  - Phone
  - Display Name
  - Password
- Output:
  - Submit thành công (mock) -> về `/{locale}/login`
  - Link phụ -> `/{locale}/login`

## State

- Không có persistent state.
- Submit chỉ mô phỏng, chưa gọi backend.

## i18n

- Dùng key nhóm:
  - `auth.register.*`
  - `auth.fields.*`
  - `meta.register*`
