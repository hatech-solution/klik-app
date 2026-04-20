# Documentation Hub

Bộ tài liệu chuẩn để developer và AI agent đọc nhanh dự án.

## Cấu trúc

- `docs/ai/` - tài liệu thiết kế cho AI agent (kiến trúc, flow, quy tắc chỉnh sửa).
- `docs/screens/` - tài liệu theo từng màn hình (route, flow, state, điểm dễ vỡ).
- `docs/skills/` - tài liệu mô tả skill và cách sử dụng skill trong repo.
- `skills/` - project skills để agent ngoài Cursor cũng đọc được trực tiếp từ repository.

## Điểm vào nhanh cho AI

1. Đọc `AGENTS.md` để nắm quy tắc tổng quan.
2. Đọc `docs/ai/00-quickstart.md` để có context trong 1 phút.
3. Đọc `docs/screens/README.md` nếu task gắn với 1 màn hình cụ thể.
4. Nếu cần thao tác sâu, đọc theo thứ tự `01` -> `08` trong `docs/ai/` (trong đó `06` mô tả toast, modal xác nhận và lỗi API store; `07` mô tả skeleton loading khi client chờ API; `08` mô tả dark mode system).
