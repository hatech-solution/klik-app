# AI Agent Guide - Klik

Tài liệu này giúp AI agent onboard nhanh vào dự án và chỉnh sửa đúng chuẩn hiện tại.

## 0) Entry points cho AI

- Tổng quan docs: `docs/README.md`
- Quickstart AI: `docs/ai/00-quickstart.md`
- Screen docs: `docs/screens/README.md`
- Project skill: `skills/klik-onboarding/SKILL.md`

## 1) Mục tiêu dự án

- Ứng dụng Next.js (App Router) mock hệ thống quản trị bot đa nền tảng.
- Hỗ trợ wildcard subdomain cho từng platform:
  - `line.<domain>`
  - `zalo.<domain>`
  - `telegram.<domain>`
  - `instagram.<domain>`
- Hỗ trợ đa ngôn ngữ `vi/en`.
- UI dùng TailwindCSS.

## 2) Công nghệ và command

- Framework: `Next.js 16` + `React 19` + `TypeScript`.
- Package manager chuẩn: `yarn` (không dùng npm/pnpm cho thay đổi mới).
- Command chính:
  - `yarn dev`
  - `yarn lint`
  - `yarn build`
  - `yarn start`

## 3) Kiến trúc route chính

- Root redirect: `app/page.tsx` -> `/login`
- Auth pages:
  - `app/login/page.tsx`
  - `app/register/page.tsx`
  - `app/reset-password/page.tsx`
- Chọn nền tảng:
  - `app/select-platform/page.tsx`
- Dashboard platform:
  - `app/platform/[platform]/page.tsx`

## 4) Wildcard subdomain

- File quan trọng: `proxy.ts`
- Cơ chế:
  - Đọc host hiện tại.
  - Nếu host có subdomain thuộc nhóm platform thì rewrite vào:
    - `/platform/<platform>/<pathname gốc>`
  - Bỏ qua path nội bộ như `/_next`, `/api`, `/favicon.ico`, `/platform/*`.

Không đổi logic rewrite trừ khi có yêu cầu rõ ràng vì đây là nền tảng của flow subdomain.

## 5) i18n (vi/en)

- Dictionary: `lib/i18n.ts`
- Server locale resolver: `lib/i18n-server.ts`
- Thứ tự lấy locale:
  1. Cookie `lang` (nếu user đã chọn thủ công)
  2. `Accept-Language` từ máy/trình duyệt user
- Switcher UI:
  - `components/language-switcher.tsx` (dạng `select`, gọn)
  - Render global ở `components/app-header.tsx`
  - Header được mount trong `app/layout.tsx`

Khi thêm text mới, luôn thêm cả `vi` và `en`.

## 6) Cấu trúc UI chính

- Header global: `components/app-header.tsx`
- Auth wrapper: `components/auth-shell.tsx`
- Forms:
  - `components/forms/login-form.tsx`
  - `components/forms/register-form.tsx`
  - `components/forms/reset-password-form.tsx`
- Platform overview:
  - `components/platform/dashboard-overview.tsx`
  - Lưu bot đã chọn vào session storage theo key từng platform.
- **Toast (Sonner):** provider `components/providers/app-toaster.tsx` trong `app/layout.tsx`; helper `lib/toast.ts` (`notifySuccess`, `notifyError`, `notifyApiFailure`). Chuỗi trong `lib/i18n.ts` → namespace `toast` (vi + en).
- **Modal xác nhận dùng chung:** `components/common/confirm-modal.tsx` (ví dụ xóa store trong `store-management.tsx`).
- **Lỗi validate store từ API:** `lib/api/store/form-field-errors.ts` + `store.errorByKey` trong i18n (chuẩn `message_key` / `field_errors` từ `klik-server`). Chi tiết: `docs/ai/06-toast-confirm-feedback.md`.
- **Chờ API trên client:** skeleton + `components/ui/skeleton.tsx` / `screen-loading-skeletons.tsx`, `aria-label` từ i18n — quy tắc màn mới: `docs/ai/07-client-loading-skeletons.md`.
- **Dark Mode:** `hooks/use-theme.ts` + `components/theme-switcher.tsx` + `components/providers/theme-provider.tsx`. Auto-detect system preference, localStorage persistence, i18n support. Chi tiết: `docs/ai/08-dark-mode.md`.

## 7) Dữ liệu mock

- Platform config: `lib/platforms.ts`
- Bot/platform/auth/store đã dùng backend API thật (`klik-server`).
- File `lib/mocks/store-mock-data.ts` có thể còn trong repo nhưng **màn store gọi API thật**, không dùng mock đó.

## 8) Nguyên tắc khi AI chỉnh sửa

- Giữ nguyên routing flow hiện tại:
  - Auth -> Select platform -> subdomain -> overview/store/user/conversation (routes độc lập).
- Không hardcode text mới ngoài dictionary i18n.
- Ưu tiên tái sử dụng component hiện có.
- Tránh chỉnh sửa phá vỡ tính nhất quán giao diện giữa các platform (chỉ khác màu/logo).
- Sau sửa code, luôn chạy:
  - `yarn lint`
  - `yarn build` (nếu thay đổi có ảnh hưởng runtime/routing)

## 9) Checklist trước khi bàn giao

- [ ] Không lỗi lint.
- [ ] Build pass.
- [ ] Flow login -> chọn platform -> vào subdomain còn hoạt động.
- [ ] Switch ngôn ngữ trên header hoạt động.
- [ ] Text mới có đủ `vi/en`.
