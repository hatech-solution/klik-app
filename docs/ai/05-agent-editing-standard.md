# Agent Editing Standard

## Trước khi sửa

- Xác định thay đổi có ảnh hưởng:
  - routing/subdomain
  - i18n dictionary
  - shared layout/header
  - dashboard flow

## Khi sửa

- Giữ code nhất quán với style hiện có.
- Ưu tiên tái sử dụng component.
- Màn client có **chờ API** rồi mới render nội dung: dùng skeleton + `LoadingRegion` / `Skeleton` theo `docs/ai/07-client-loading-skeletons.md` (không để một dòng “Đang tải…” thay cả vùng nội dung).
- Thêm comment chỉ khi cần giải thích logic khó.
- Với module có gọi API, ưu tiên tách theo cấu trúc:
  - `lib/api/<module>/client.ts`: HTTP calls, headers, error handling
  - `lib/api/<module>/types.ts`: API DTO/request payload types
  - `lib/api/<module>/mapper.ts`: map DTO -> domain types dùng cho UI
  - `lib/api/<module>/index.ts`: barrel export
- Error model dùng chung:
  - `lib/api/error.ts` là nơi định nghĩa `ApiClientError` và helper (`isUnauthorizedError`, `getErrorMessage`, `parseApiErrorMessage`).
  - UI không so sánh string lỗi thủ công; luôn dùng helper để xử lý redirect 401 và fallback message.
- Request cần auth:
  - Dùng `lib/api/authenticated-request.ts` để tự gắn `Authorization`, tự refresh token khi gặp `401`, rồi retry 1 lần.
  - Không truyền `accessToken` thủ công qua nhiều tầng hàm.
- Domain type dùng chung đặt ở `lib/types/*`, constants dùng chung đặt ở `lib/constants/*`.

## Sau khi sửa

- Chạy:
  - `yarn lint`
  - `yarn build` (nếu thay đổi runtime/routing)
- Tự kiểm tra:
  - login -> select platform -> subdomain -> dashboard
  - đổi ngôn ngữ trên header
  - text mới có đủ `vi/en`

## Không nên làm

- Không đổi package manager.
- Không thêm text hardcode ngoài dictionary.
- Không sửa rewrite subdomain nếu chưa phân tích đầy đủ side effects.
