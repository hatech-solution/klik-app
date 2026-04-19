# Skeleton loading cho client (chờ API)

Mục tiêu: giảm cảm giác “trống”, giữ **ổn định layout** (ít nhảy khối), đồng bộ với stack hiện tại (Next.js App Router, React 19, Tailwind 4, **không** thêm thư viện UI chỉ cho skeleton).

## 0) Quy tắc bắt buộc khi thêm màn mới (AI / developer)

Khi tạo hoặc sửa **client component** có gọi API và hiển thị UI sau khi có dữ liệu:

1. **Không** chỉ dùng một dòng chữ “Đang tải…” làm toàn bộ vùng chờ (trừ trường hợp rất nhỏ như hint một dòng dưới control đơn lẻ).
2. Thêm skeleton **bám theo layout** nội dung sẽ render (card, bảng, form section, sidebar + main, v.v.).
3. Tái sử dụng:
   - `Skeleton` từ `components/ui/skeleton.tsx` để dựng block tùy chỉnh;
   - hoặc các khối có sẵn trong `components/ui/screen-loading-skeletons.tsx` nếu khớp pattern;
   - bọc vùng chờ bằng `LoadingRegion` (có `role="status"`, `aria-busy`, `aria-label`) và truyền `aria-label` từ **dictionary** `lib/i18n.ts` (chuỗi đã có hoặc key mới đủ vi/en).
4. Trạng thái **lỗi** vẫn dùng banner / toast như hiện tại; skeleton chỉ cho phase chờ dữ liệu thành công.

Nếu màn mới không khớp khối nào trong `screen-loading-skeletons.tsx`, **thêm** một component skeleton mới trong file đó (hoặc file `components/ui/*-skeleton.tsx` cạnh màn nếu quá đặc thù) rồi dùng từ màn đó — tránh copy-paste block `animate-pulse` rải rác.

## 1) Code đã có trong repo

| File | Vai trò |
|------|---------|
| `components/ui/skeleton.tsx` | Primitive `Skeleton` (`animate-pulse`, `bg-slate-200/90`). |
| `components/ui/screen-loading-skeletons.tsx` | `LoadingRegion`, `SelectPlatformGridSkeleton`, `StoreTableSkeleton`, `DashboardShellBotsSkeleton`, `DashboardShellRedirectSkeleton`, `BotSelectCardSkeleton`, `StoreFormPageSkeleton`, `StoreSettingsGateBodySkeleton`, `StoreOperatingHoursBodySkeleton`, `RouteGuardSkeleton`. |
| `lib/i18n.ts` → `common.loadingScreen` | Nhãn `aria-label` cho màn hình chờ guard (vi/en). |

Các màn đã gắn skeleton (tham chiếu khi làm tương tự):

- `components/platform/select-platform-view.tsx`
- `components/platform/store-management.tsx`
- `components/platform/store-edit-form-client.tsx`, `store-new-form-client.tsx`, `store-management-route.tsx`
- `components/platform/dashboard-shell.tsx`, `platform-dashboard.tsx`
- `components/platform/store-settings-layout-client.tsx`, `store-operating-hours-view.tsx`
- `components/platform/store-form.tsx` (vùng `regionsLoading`)
- `components/providers/route-guard.tsx`

## 2) Mục tiêu UX (ôn tập)

1. **Khớp hình dạng nội dung** thay vì chỉ một câu chữ.
2. **Giữ khung** gần với bản loaded.
3. **Initial load** vs refetch: có thể skeleton đầy đủ hoặc nhẹ tùy màn; tránh che shell đã ổn định.
4. **Lỗi không dùng skeleton.**

## 3) i18n & accessibility

- Skeleton thuần hình **không** cần chữ hiển thị; luôn có **một** nguồn nhãn cho AT: `LoadingRegion` với `aria-label={t…}` hoặc `aria-label` tương đương.
- `common.loadingScreen` dùng cho guard / màn toàn viền khi không gắn được key domain cụ thể.

## 4) Ngoài phạm vi

- `loading.tsx` (RSC) — tách với client fetch; bổ sung khi route chuyển sang Suspense.
- Spinner nút submit / mutation — không gộp vào spec skeleton list.

## 5) Checklist sau khi chỉnh màn có API

- [ ] Có skeleton hoặc `LoadingRegion` + layout giả khi pending.
- [ ] `aria-label` / i18n đủ vi/en nếu thêm key.
- [ ] Không flash skeleton sau khi đã có data (cleanup `cancelled` / `mounted` trong effect).
- [ ] `yarn lint` và `yarn build` khi đổi layout/route/types.

---

**Liên quan:** `docs/ai/04-ui-state-flow.md`, `docs/ai/05-agent-editing-standard.md`, `docs/ai/06-toast-confirm-feedback.md`.
