# System Overview

## Stack

- Next.js App Router
- React + TypeScript
- TailwindCSS
- Package manager: Yarn

## Domain logic

- 1 app phục vụ nhiều platform theo subdomain.
- UI layout dashboard giữ cấu trúc giống nhau giữa platform, chỉ đổi màu/logo.

## Route map

- `/login`
- `/register`
- `/reset-password`
- `/select-platform`
- `/platform/[platform]` (được rewrite từ subdomain)

## Dữ liệu hiện tại

- Auth, platform, bot và **store** (dashboard) dùng backend API thực (`klik-server`).
- Một số phân hệ UI (user/conversation trên dashboard) vẫn mock; file `lib/mocks/store-mock-data.ts` không còn được màn store dashboard import.
