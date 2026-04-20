# Platform Session & Dynamic UI Architecture Design (Client-Side Only)

## 1. Overview
Hệ thống sử dụng kiến trúc hoàn toàn ở phía Client-side (Frontend SPA) để quản lý định danh nền tảng.
1. **Lựa chọn Platform:** Người dùng chọn platform (như Messenger, Zalo, Telegram, v.v.).
2. **Client-Side Storage:** Client sẽ lưu trữ trực tiếp `platform_id` này ở `localStorage` của trình duyệt.
3. **Gọi API:** Trong mọi request API gọi lên Backend, Client sẽ tự động đính kèm `platform_id` này vào Header (VD: `X-Platform-ID: zalo`) để Backend biết request tới từ platform nào.
4. **Dynamic UI:** Client đọc thông tin `platform_id` từ trình duyệt để tuỳ chỉnh giao diện ngay lập tức thông qua React Context hoặc Zustand (Màu sắc, Icon, Cấu trúc Menu).

---

## 2. Kiến trúc Hệ thống & Luồng Dữ liệu (Client-Based)

### Bước 1: Platform Selection
- Màn hình sử dụng `'use client'`. 
- Khi người dùng chọn Platform, lưu ngay `platform_id` vào trình duyệt và chuyển hướng vào Dashboard.

### Bước 2: Client-side Storage
Trình duyệt sẽ tự xử lý việc lưu trữ trạng thái người dùng tại `localStorage`.
- Ghi dữ liệu:
  - `localStorage.setItem('platform_id', platformId)` 
- Dùng Next.js `useRouter` để chuyển hướng mượt mà `<button onClick={() => router.push('/vi/overview')}>`.

### Bước 3: Đính kèm Header qua Axios Interceptor
Sử dụng Axios để thiết lập header toàn cục cho mọi lệnh gọi API về sau. Header `X-Platform-ID` sẽ được gửi lên Backend ở mọi request.
```typescript
import axios from 'axios';

const apiClient = axios.create({ baseURL: 'YOUR_BACKEND_URL' });

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const platformId = localStorage.getItem('platform_id');
    if (platformId) {
      config.headers['X-Platform-ID'] = platformId;
    }
  }
  return config;
});

export default apiClient;
```

### Bước 4: Client-side Dynamic UI & Protected Routes
Sử dụng một **Zustand Store** (với `use client`) kết hợp với hàm `useEffect`. 
Để ngăn người truy cập Dashboard mà chưa chọn Platform: bọc ứng dụng vào một Client-side Route Guard wrapper check sự tồn tại của `platform_id`.

---

## 3. Bản vẽ cấu trúc File Đề xuất

```text
app/
 ├── [locale]/
 │    ├── platform-select/
 │    │    └── page.tsx         <-- (Client) Giao diện cho user click chọn platform
 │    ├── (dashboard)/
 │    │    ├── layout.tsx       <-- Chứa component Client Guard bảo vệ route, bọc UI context
 │    │    └── page.tsx         <-- Giao diện Dashboard (Main)
 ├── lib/
 │    └── api/
 │         └── client.ts        <-- Axios instance có interceptor gắn header X-Platform-ID
 ├── store/
 │    └── usePlatformStore.ts   <-- Zustand store lưu `platformId` logic global
 └── components/
      └── providers/
           ├── route-guard.tsx      <-- Kiểm tra platform_id có tồn tại không -> Redirect
           └── platform-theme.tsx   <-- Component tiêm CSS tùy biến theo Platform
```

---

## 4. Chi tiết Implement 

### 4.1. Platform State Management (Zustand)
Quản lý trạng thái Global để UI tự động cập nhật:
**`store/usePlatformStore.ts`**
```typescript
import { create } from 'zustand';

interface PlatformState {
  platformId: string | null;
  setPlatform: (platformId: string) => void;
  loadFromStorage: () => void;
}

export const usePlatformStore = create<PlatformState>((set) => ({
  platformId: null,
  
  setPlatform: (platformId) => {
    localStorage.setItem('platform_id', platformId);
    set({ platformId });
  },

  loadFromStorage: () => {
    if (typeof window !== 'undefined') {
      const pId = localStorage.getItem('platform_id');
      // Set attribute ra thẻ html để CSS dùng biến ví dụ: :root[data-platform="zalo"] { --primary: blue; } 
      if (pId) document.documentElement.setAttribute('data-platform', pId);
      
      set({ platformId: pId });
    }
  }
}));
```

### 4.2. Bảo vệ trang Dashboard (Client Route Guard)
Chỉ định user vào Dashboard MÀ CHƯA chọn Platform thì đẩy ra ngoài màn `platform-select`.
**`components/providers/route-guard.tsx`**
```tsx
'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlatformStore } from '@/store/usePlatformStore';

export const RouteGuard = ({ children, locale }: { children: React.ReactNode, locale: string }) => {
  const router = useRouter();
  const { loadFromStorage, platformId } = usePlatformStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadFromStorage();
    const pId = localStorage.getItem('platform_id');
    
    if (!pId) {
      router.replace(`/${locale}/platform-select`);
    } else {
      setIsReady(true);
    }
  }, [router, locale, platformId]);

  if (!isReady) return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;

  return <>{children}</>;
};
```

### 4.3. Trigger Chọn Nền Tảng trên UI
**`app/[locale]/platform-select/page.tsx`**
```tsx
'use client'
import { usePlatformStore } from '@/store/usePlatformStore';
import { useRouter } from 'next/navigation';

export default function PlatformSelectPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const { setPlatform } = usePlatformStore();

  const handleSelect = (platformId: string) => {
    setPlatform(platformId); // Lưu local storage & bật state global
    router.push(`/${params.locale}/overview`);
  };

  return (
    <div className="flex flex-col space-y-4 p-8">
       <h2 className="text-xl font-bold">Vui lòng chọn Nền Tảng</h2>
       <button onClick={() => handleSelect('zalo')} className="bg-blue-600 text-white p-2">Zalo</button>
       <button onClick={() => handleSelect('messenger')} className="bg-indigo-600 text-white p-2">Messenger</button>
       <button onClick={() => handleSelect('telegram')} className="bg-sky-500 text-white p-2">Telegram</button>
    </div>
  );
}
```

---

## 5. Next Steps
Với logic rút gọn cực kỳ tối ưu này:
1. Bạn có thể chép thẳng `api/client.ts` Axios vào để test gọi Backend.
2. Xây dựng store (`usePlatformStore.ts`).
3. Ốp `RouteGuard` vào `layout.tsx` của component Dashboard.
4. Triển khai biến màu sắc CSS thông qua thuộc tính `data-platform`.
