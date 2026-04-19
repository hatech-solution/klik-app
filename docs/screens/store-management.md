# Screen: Quản lý Store (trong Platform Dashboard)

## Route

- **Không có route riêng** — là một section trong dashboard platform.
- Cùng URL với dashboard: `https://<platform>.<domain>/{locale}/dashboard` (rewrite subdomain), page `app/[locale]/dashboard/page.tsx`, `platform_id` từ client store (zustand).
- User phải **đã chọn bot** (`bot_id` trong `localStorage`) thì mới render nội dung store; menu trái chọn mục **Store**.

## Mục tiêu

- Liệt kê cửa hàng theo bot đang chọn (`GET /api/v1/stores`, header `X-Bot-Id`).
- Tải danh sách vùng hỗ trợ (`GET /api/v1/regions`, **không** gửi `X-Bot-Id`) để điền dropdown và gợi ý múi giờ / tiền tệ mặc định theo vùng.
- Thêm / sửa cửa hàng (`POST` / `PUT`) kèm **locale booking**: `region_code`, `timezone` (IANA), `currency_code` (ISO 4217); xóa mềm (`DELETE`).
- Hiển thị lỗi validate từ API theo từng field + `message_key` (chuẩn backend, xem `klik-server/docs/features/store_management.md`).
- Xác nhận xóa bằng modal dùng chung, toast khi thành công / lỗi tải danh sách (stores hoặc regions).

## Thành phần chính

- UI: `components/platform/store-management.tsx`
- API: `lib/api/store/client.ts`, `lib/api/store/types.ts`
- Map lỗi field: `lib/api/store/form-field-errors.ts` (gồm `region_code`, `timezone`, `currency_code`)
- Lỗi chung API: `lib/api/error.ts` (`ApiClientError`, `getErrorMessageByKey`, …)
- Toast: `lib/toast.ts` (Sonner, mount tại `app/layout.tsx`)
- Modal xác nhận: `components/common/confirm-modal.tsx`

## Giao diện (UI)

- **Bảng** (`overflow-x-auto`, `min-width` để không vỡ cột trên màn hẹp):
  - Cột: tên, **vùng · tiền tệ** (`region_code` + `currency_code`), **múi giờ** (truncate, hover/`title` xem đủ chuỗi IANA), địa chỉ, SĐT, trạng thái, hành động.
  - Trạng thái tải / rỗng: dùng i18n `store.loadingStoreList`, `store.emptyStoreList` (không hardcode).
- **Modal thêm/sửa**:
  - Khung rộng (`max-w-2xl`), chiều cao tối đa + scroll nội dung dài.
  - Khối **“Vùng & giờ (booking / lễ)”** (`store.bookingLocaleTitle`): select vùng (disabled khi `regionsLoading`), hint `store.regionHint`, dòng `store.loadingRegions` khi đang tải regions; hai ô **timezone** và **currency** (có thể chỉnh tay sau khi chọn vùng).
  - Phần còn lại: địa chỉ, liên hệ, URL, mô tả, v.v. như trước.

## Input/Output flow

- Input:
  - Chọn bot trên header dashboard (bắt buộc để có `X-Bot-Id` cho **stores**).
  - Khi mount component: song song / độc lập — tải `regions` (chỉ cần session); khi có `botId` — tải `stores`.
  - Thêm / sửa: form modal (locale booking + các field còn lại).
  - Xóa: mở `ConfirmModal`, xác nhận rồi gọi `DELETE`.
- Output:
  - Bảng danh sách store cập nhật sau CRUD thành công.
  - Toast: thành công tạo/sửa/xóa; lỗi khi tải danh sách stores **hoặc** regions (`toast.loadRegionsFailed`).
  - Lỗi submit (validate): banner + viền đỏ theo field (không toast trùng).

## State (local trong component)

- Danh sách: `stores`, `loading`, `error`.
- Vùng: `regions`, `regionsLoading`.
- Modal form: `showModal`, `editingStoreId`, `submitting`, `formError`, `fieldErrors`, `regionCode`, `timezone`, `currencyCode`, và các field string form khác (tên, địa chỉ, …).
- Xóa: `deleteTargetId`, `deleteBusy`, `deleteError`.

## i18n

- Nhãn UI & validation client: `store.*` trong `lib/i18n.ts` (gồm `store.region`, `store.timezone`, `store.currency`, `store.bookingLocaleTitle`, `store.loadingStoreList`, `store.emptyStoreList`, `store.loadingRegions`, …).
- Lỗi API store: `store.errorByKey` (khớp `message_key` server, gồm các mã validate region/timezone/currency).
- Toast: `toast.storeCreated`, `toast.storeUpdated`, `toast.storeDeleted`, `toast.loadStoresFailed`, **`toast.loadRegionsFailed`**.
- Modal xóa: `store.deleteModalTitle`, `store.deleteConfirm`, `store.deleteFailed`, `common.confirmModal.*`.

## API tóm tắt

| Endpoint | Header bot | Mục đích |
|----------|------------|----------|
| `GET /api/v1/regions` | Không | Dropdown vùng + default timezone/currency |
| `GET/POST/PUT/DELETE /api/v1/stores` | `X-Bot-Id` | CRUD cửa hàng theo bot |

Luôn gửi `Authorization` (Bearer) qua `authorizedRequest` như trong `lib/api/store/client.ts`.

## Điểm dễ vỡ

- **Stores** luôn kèm `Authorization` + `X-Bot-Id`; **regions** chỉ cần user đăng nhập, không phụ thuộc bot.
- Không hardcode text ngoài dictionary.
- Đừng đồng bộ “bot đã chọn” với list bot trước khi API list trả về (xử lý tương tự `botsListReady` trên `platform-dashboard.tsx`).
- Chi tiết toast / modal / parse lỗi: `docs/ai/06-toast-confirm-feedback.md`.
