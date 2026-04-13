# Nano Message Support

Next.js app mô phỏng hệ thống quản trị bot đa nền tảng (LINE, Zalo, Telegram, Instagram):
- Hỗ trợ wildcard subdomain cho từng platform.
- Giao diện TailwindCSS.
- Hỗ trợ đa ngôn ngữ `vi/en` bằng cookie `lang`.

## Chạy bằng Yarn

```bash
yarn install
yarn dev
```

Mở:
- `http://localhost:3000/login`
- Sau khi chọn platform sẽ chuyển qua:
  - `http://line.localhost:3000`
  - `http://zalo.localhost:3000`
  - `http://telegram.localhost:3000`
  - `http://instagram.localhost:3000`

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
