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
- Thêm comment chỉ khi cần giải thích logic khó.

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
