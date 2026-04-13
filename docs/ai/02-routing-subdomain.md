# Routing & Subdomain

## Mục đích

Hỗ trợ truy cập dashboard theo wildcard subdomain:

- `line.<domain>`
- `zalo.<domain>`
- `telegram.<domain>`
- `instagram.<domain>`

## Cách hoạt động

- File xử lý: `proxy.ts`.
- Proxy đọc host request và xác định subdomain có thuộc platform hợp lệ không.
- Nếu hợp lệ, rewrite URL về route nội bộ:
  - `/platform/<platform>/<pathname gốc>`
- Bỏ qua các path nội bộ:
  - `/_next`
  - `/api`
  - `/favicon.ico`
  - `/platform/*`

## Lưu ý khi sửa

- Không thay matcher/rewrite tùy tiện.
- Nếu thêm platform mới, cập nhật đồng thời:
  - `lib/platforms.ts`
  - logic subdomain resolve nếu cần
  - dictionary i18n cho label/description
