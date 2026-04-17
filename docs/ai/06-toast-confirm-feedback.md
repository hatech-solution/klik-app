# Toast, modal xác nhận & phản hồi lỗi API (FE)

Tài liệu mô tả cách app phản hồi sau các thao tác gọi API: toast toàn cục, modal xác nhận tái sử dụng, và map lỗi validate store theo chuẩn backend.

## Toast (Sonner)

- **Thư viện:** `sonner` (dependency trong `package.json`).
- **Provider:** `components/providers/app-toaster.tsx` — component client, mount **một lần** trong `app/layout.tsx` (cùng cấp `{children}` trong `<body>`).
- **Helper:** `lib/toast.ts` (file có `"use client"` — chỉ import từ client components):
  - `notifySuccess(message)`
  - `notifyError(message)`
  - `notifyApiFailure(err, fallback, errorByKey?)` — với `ApiClientError` + `errorByKey` thì dùng `getErrorMessageByKey` từ `lib/api/error.ts`.
- **i18n:** mọi chuỗi toast cố định nằm trong namespace `toast` ở `lib/i18n.ts` (luôn có cả `vi` và `en`). Khi thêm toast mới, thêm key đối xứng ở hai locale.

### Quy ước đang dùng

- **Thành công thao tác API** (tạo/sửa/xóa store, tạo/sửa/vô hiệu hóa bot): toast success.
- **Lỗi tải danh sách** (stores, bots, platforms): toast error + (nếu có) UI lỗi inline trên màn hình.
- **Lỗi form store** (create/update): vẫn ưu tiên lỗi theo field + banner trên modal; **không** bắn toast trùng cho cùng một lỗi validate.
- **Xóa store thất bại:** chỉ hiển thị trong modal xác nhận (tránh trùng toast + modal).
- **Auth (login/register):** giữ phản hồi trên form; chưa gắn toast để tránh trùng lặp.

## Modal xác nhận dùng chung

- **Component:** `components/common/confirm-modal.tsx`.
- **Props chính:** `open`, `title`, `description`, `cancelLabel`, `confirmLabel`, `confirmVariant` (`danger` | `default`), `busy`, `busyConfirmLabel`, `errorMessage`, `onCancel`, `onConfirm`.
- **Ví dụ:** xóa store trong `components/platform/store-management.tsx` (thay cho `window.confirm`).

Chuỗi nút/hành động chung có thể lấy từ `common.confirmModal` trong i18n; nội dung theo ngữ cảnh (ví dụ tiêu đề xóa store) nằm dưới `store.*`.

## Store: map lỗi API (create/update)

- Backend trả `error.message_key` và `field_errors[]` (xem `klik-server/docs/features/store_management.md`).
- **Parse:** `lib/api/error.ts` (`parseApiError`, `toApiClientError`).
- **Map field → ô form:** `lib/api/store/form-field-errors.ts` (`buildStoreFormFieldErrors`, `resolveStoreSubmitErrors`).
- **Bản dịch lỗi:** `store.errorByKey` trong `lib/i18n.ts` (khớp `message_key` từ server).

## Liên quan file

| Mục | File |
|-----|------|
| Toaster | `components/providers/app-toaster.tsx`, `app/layout.tsx` |
| Toast API | `lib/toast.ts` |
| Confirm modal | `components/common/confirm-modal.tsx` |
| Store UI + API | `components/platform/store-management.tsx` |
| Store field errors | `lib/api/store/form-field-errors.ts` |
| Bot + toast | `components/platform/platform-dashboard.tsx` |
| Platform list + toast | `components/platform/select-platform-view.tsx` |
