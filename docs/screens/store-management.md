# Screen: Quản lý Store (trong Platform Dashboard)

## Route

- **Không có route riêng** — là một section trong dashboard platform.
- Cùng URL với dashboard: `https://<platform>.<domain>/{locale}/dashboard` (rewrite subdomain), page `app/[locale]/dashboard/page.tsx`, `platform_id` từ client store (zustand).
- User phải **đã chọn bot** (`bot_id` trong `localStorage`) thì mới render nội dung store; menu trái chọn mục **Store**.

## Mục tiêu

- Liệt kê cửa hàng theo bot đang chọn (`GET /api/v1/stores`, header `X-Bot-Id`).
- Thêm / sửa cửa hàng (`POST` / `PUT`), xóa mềm (`DELETE`).
- Hiển thị lỗi validate từ API theo từng field + `message_key` (chuẩn backend, xem `klik-server/docs/features/store_management.md`).
- Xác nhận xóa bằng modal dùng chung, toast khi thành công / lỗi tải danh sách.

## Thành phần chính

- UI: `components/platform/store-management.tsx`
- API: `lib/api/store/client.ts`, `lib/api/store/types.ts`
- Map lỗi field: `lib/api/store/form-field-errors.ts`
- Lỗi chung API: `lib/api/error.ts` (`ApiClientError`, `getErrorMessageByKey`, …)
- Toast: `lib/toast.ts` (Sonner, mount tại `app/layout.tsx`)
- Modal xác nhận: `components/common/confirm-modal.tsx`

## Input/Output flow

- Input:
  - Chọn bot trên header dashboard (bắt buộc để có `X-Bot-Id`).
  - Thêm / sửa: form modal (tên, địa chỉ, SĐT, email, mô tả, URL mạng xã hội / map / website).
  - Xóa: mở `ConfirmModal`, xác nhận rồi gọi `DELETE`.
- Output:
  - Bảng danh sách store cập nhật sau CRUD thành công.
  - Toast: thành công tạo/sửa/xóa; lỗi khi tải danh sách.
  - Lỗi submit (validate): banner + viền đỏ theo field (không toast trùng).

## State (local trong component)

- `stores`, `loading`, `error` — danh sách và trạng thái tải.
- Modal form: `showModal`, `editingStoreId`, `submitting`, `formError`, `fieldErrors`, các field string form.
- Xóa: `deleteTargetId`, `deleteBusy`, `deleteError`.

## i18n

- Nhãn UI & validation client: `store.*` trong `lib/i18n.ts`.
- Lỗi API store: `store.errorByKey` (khớp `message_key` server).
- Toast cố định: `toast.storeCreated`, `toast.storeUpdated`, `toast.storeDeleted`, `toast.loadStoresFailed`.
- Modal xóa: `store.deleteModalTitle`, `store.deleteConfirm`, `store.deleteFailed`, `common.confirmModal.*`.

## Điểm dễ vỡ

- Luôn gửi header `Authorization` + `X-Bot-Id` theo client `lib/api/store/client.ts`.
- Không hardcode text ngoài dictionary.
- Đừng đồng bộ “bot đã chọn” với list bot trước khi API list trả về (xử lý tương tự `botsListReady` trên `platform-dashboard.tsx`).
- Chi tiết toast / modal / parse lỗi: `docs/ai/06-toast-confirm-feedback.md`.
