# Screen: Login

## Route

- `/{locale}/login`

## Mục tiêu

- Cho user nhập `email` và `password`.
- Chuyển sang màn chọn platform sau khi submit (mock login success).

## Thành phần chính

- Page: `app/[locale]/login/page.tsx`
- Form: `components/forms/login-form.tsx`
- Shell: `components/auth-shell.tsx`

## Input/Output flow

- Input:
  - Email
  - Password
- Output:
  - Submit -> `router.push('/{locale}/select-platform')`
  - Link phụ:
    - Sang đăng ký: `/{locale}/register`
    - Sang reset password: `/{locale}/reset-password`

## State

- Không có persistent state tại màn này.
- Chỉ xử lý submit client-side (mock).

## i18n

- Dùng key nhóm:
  - `auth.login.*`
  - `auth.fields.*`
  - `meta.login*`
