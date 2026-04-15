# Klik

Next.js app mô phỏng hệ thống quản trị bot đa nền tảng (LINE, Zalo, Telegram, Instagram):
- Giao diện TailwindCSS.
- Hỗ trợ đa ngôn ngữ `vi/en` qua URL (Route `[locale]`) và được detect bằng middleware/i18n.
- Quản lý định dạng Platform thông qua `localStorage` (`platform_id`) và đính kèm vào Header (`X-Platform-ID`) thay vì dùng Subdomain.

## Chạy bằng Yarn / NPM

```bash
npm install # hoặc yarn install
npm run dev # hoặc yarn dev
```

Mở:
- Giao diện mặc định chạy trên một web domain duy nhất: `http://localhost:3000`
- Khởi đầu hệ thống sẽ yêu cầu người dùng chọn Nền Tảng tại màn hình `http://localhost:3000/vi/platform-select`.
- Sau khi chọn Platform, hệ thống tự lưu `platform_id` vào local storage và chuyển hướng sang Dashboard chính ở path `http://localhost:3000/vi/dashboard`. Mọi request gọi API Backend sẽ tự động được gửi kèm header `X-Platform-ID`.

## Scripts

```bash
yarn lint
yarn build
yarn start
```

## Ghi chú i18n

- Ngôn ngữ được lưu qua cookie `lang`.
- Có thể đổi ngôn ngữ trực tiếp trên UI bằng nút `Tiếng Việt / English`.
- Nếu chưa có cookie, hệ thống sẽ tự detect từ `Accept-Language`.
