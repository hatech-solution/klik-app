# Screen: Dashboard cửa hàng (Store Hub)

## Route

- **Hub (mặc định sau khi bấm “Quản lý”)**: `/{locale}/store/[storeId]`
- URL thực tế: `https://<platform>.<domain>/{locale}/store/[storeId]` (cùng cơ chế rewrite subdomain với các màn trong `app/[locale]/store/`).
- Layout: `app/[locale]/store/layout.tsx` — dùng `DashboardShell` để **giao diện nhất quán** với dashboard platform (header, nav, theme theo platform).

## Mục tiêu

- Cung cấp **một điểm vào** quản trị theo từng cửa hàng sau khi user chọn **Quản lý** trên bảng danh sách store (`/{locale}/store`).
- Trang hub hiển thị **các module** tương ứng phần cấu hình vận hành của store; **mỗi module** dẫn tới màn **cài đặt / quản lý riêng** của module đó (không gom toàn bộ form trên một trang).
- Có khu vực **thống kê** (dashboard store) — có thể là section trên cùng của hub hoặc route con tùy triển khai (xem mục Route con).

## Luồng người dùng

1. User vào `/{locale}/store`, chọn bot (bắt buộc như hiện tại).
2. Trên hàng store, bấm **Quản lý** → điều hướng tới `/{locale}/store/[storeId]` (hub).
3. Trên hub: xem tóm tắt / thống kê (nếu đã có dữ liệu API) và **danh sách module** (card hoặc grid tương tự phong cách module trên overview platform).
4. Bấm một module → chuyển tới route **setting** của module đó (xem bảng Route con).

## Module trên hub (bắt buộc theo product)

| Module (UI) | Nội dung / mục đích | Điều hướng tới (setting) |
|-------------|---------------------|---------------------------|
| **Thống kê** | Số liệu tổng quan theo store (booking, nhân sự, v.v. — phụ thuộc API backend khi triển khai) | Mặc định có thể **ở lại hub** (section đầu trang) hoặc `/{locale}/store/[storeId]/stats` nếu tách trang. |
| **Quản lý giờ** | Giờ mở cửa / lịch vận hành store | `/{locale}/store/[storeId]/hours` (hoặc tên file tương đương dưới `app/[locale]/store/[storeId]/`) |
| **Quản lý nhân viên** | CRUD / lịch nhân viên theo store | `/{locale}/store/[storeId]/staff` |
| **Cài đặt public booking** | Bật/tắt, copy link, cấu hình hiển thị public (theo contract API hiện có) | `/{locale}/store/[storeId]/public-booking` |
| **Danh sách booking** | Liệt kê / lọc booking nội bộ theo store | `/{locale}/store/[storeId]/bookings` |

**Quy ước**: nhãn UI và mô tả ngắn **không hardcode** — thêm key trong `lib/i18n.ts` (vi + en), ví dụ namespace gợi ý `storeDashboard.*` hoặc mở rộng `store.*` có tiền tố rõ ràng.

## Giao diện (UI)

- **Tương đồng dashboard ngoài**: tái sử dụng pattern từ `components/platform/dashboard-overview.tsx` / `DashboardShell` — spacing, typography, card/module grid, màu theo `platform` (accent), dark mode (`var(--dm-*)`).
- Hub gồm:
  - Tiêu đề store (tên, có thể badge trạng thái) — lấy từ context hoặc `GET` store theo `storeId` nếu cần.
  - **Khu thống kê** (skeleton khi loading, `aria-label` từ i18n).
  - **Lưới module** — mỗi ô có tiêu đề, mô tả ngắn, CTA hoặc toàn bộ card clickable → `Link` tới route setting tương ứng.
- Trạng thái lỗi / rỗng: toast + banner theo `docs/ai/06-toast-confirm-feedback.md`; loading theo `docs/ai/07-client-loading-skeletons.md`.

## Thành phần kỹ thuật (gợi ý triển khai)

- Page hub: `app/[locale]/store/[storeId]/page.tsx` (client hoặc server + client section tùy nhu cầu fetch).
- Component UI hub (tách khỏi page nếu file dài): ví dụ `components/platform/store-dashboard-hub.tsx`.
- Màn con từng module: `app/[locale]/store/[storeId]/<segment>/page.tsx` — map 1:1 với bảng Route con ở trên.
- API: tái sử dụng / mở rộng `lib/api/store/*` và module booking/public booking đã có; mọi request store-scoped gửi đúng header/id theo contract backend (đối chiếu `klik-server/docs` tương ứng).

## State

- **Hub**: `store` (metadata), `stats` (nếu có endpoint), `loading`, `error`.
- **Không** nhân đôi state bot/platform — lấy từ `dashboard-workspace-context` / shell hiện có trong `store` layout tree.

## i18n

- Thêm đủ **vi + en** cho: tiêu đề hub, tên từng module, mô tả ngắn, nút **Quản lý** trên bảng list store, nhãn loading/error.

## Điểm dễ vỡ

- `storeId` trên URL phải khớp store thuộc **bot đang chọn**; nếu không khớp (đổi bot / store không tồn tại) → xử lý 404 hoặc redirect về `/{locale}/store` kèm thông báo.
- Giữ nhất quán **routing** với phần còn lại của app: segment `store` (số ít) đã dùng cho `new`, `edit`; tránh nhập nhằng với path cũ `stores/...` đã gỡ.
- Liên kết public booking cho khách vẫn là route `(public)` — tách biệt với hub admin.

## Liên quan

- Danh sách store & CRUD: `docs/screens/store-management.md`
- Overview platform: `docs/screens/platform-dashboard.md`
- Skeleton / toast: `docs/ai/07-client-loading-skeletons.md`, `docs/ai/06-toast-confirm-feedback.md`
