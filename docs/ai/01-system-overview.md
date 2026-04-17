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

- Auth, platform, bot đã dùng backend API thực (`klik-server`).
- Mock hiện chỉ còn cho module Store trong dashboard (`lib/mocks/store-mock-data.ts`).
