# Dark Mode Implementation

Hướng dẫn triển khai và sử dụng chế độ tối (dark mode) trong ứng dụng Klik.

## Tổng quan

Hệ thống hỗ trợ dark mode với các tính năng:
- Toggle button trong header
- Tự động lưu preference vào localStorage
- Auto-detect system preference
- SSR/hydration safe
- Hỗ trợ đa ngôn ngữ

## Kiến trúc

### 1. Theme Management Hook

**File:** `hooks/use-theme.ts`

```typescript
type Theme = "light" | "dark";

const { theme, setTheme, toggleTheme, mounted } = useTheme();
```

**API:**
- `theme`: current theme state ("light" | "dark")
- `setTheme(theme)`: set theme programmatically
- `toggleTheme()`: toggle between light/dark
- `mounted`: boolean cho hydration safety

**Storage:** localStorage key `"theme"`

**Auto-detection:** fallback về system preference qua `prefers-color-scheme`

### 2. Theme Switcher Component

**File:** `components/theme-switcher.tsx`

```tsx
<ThemeSwitcher 
  lightLabel={t.theme.light}
  darkLabel={t.theme.dark}
/>
```

**UI:**
- Button với icon 🌙 (dark) / ☀️ (light)
- Text label (ẩn trên mobile via `hidden sm:inline`)
- Skeleton loader khi chưa mounted

### 3. Theme Provider

**File:** `components/providers/theme-provider.tsx`

Wrapper tối giản; class `dark` trên `<html>` và màu nền/chữ toàn app do `useTheme` + biến CSS.

### 4. Màu nền (soft dark, dễ đọc)

- **`app/globals.css`:** `html.dark` gán `--background` / `--foreground` (zinc-800 + chữ gần trắng) để `body` dùng chung với Tailwind theme.
- **`styles/dark-mode.css`:** token `--dm-*` cho header, sidebar, thẻ nội dung — bề mặt **zinc-700** (~`#3f3f46`), không dùng nền đen tuyệt đối; chữ secondary/muted tách bậc để WCAG dễ đạt hơn.

## Integration Points

### 1. Header Integration

**File:** `components/app-header.tsx`

```tsx
<div className="flex items-center gap-2">
  <ThemeSwitcher lightLabel={t.theme.light} darkLabel={t.theme.dark} />
  <LanguageSwitcher ... />
  <LogoutButton ... />
</div>
```

### 2. Layout Integration

**File:** `app/layout.tsx`

Import `globals.css` + `styles/dark-mode.css`, bọc `ThemeProvider`, `body` không cần class Tailwind `dark:` — màu theo biến CSS khi có `html.dark`.

### 3. TailwindCSS (tuỳ chọn)

Có thể dùng `tailwind.config` với `darkMode: 'class'` cho component vẫn dùng utility `dark:`; phần shell chính đang dùng CSS token trong `dark-mode.css`.

## Styling Guidelines

### 1. Dark Mode Classes

Sử dụng `dark:` prefix cho dark mode styles:

```tsx
// Background
className="bg-white dark:bg-slate-800"

// Text
className="text-slate-900 dark:text-slate-100"

// Borders
className="border-slate-200 dark:border-slate-700"

// Interactive states
className="hover:bg-slate-100 dark:hover:bg-slate-700"
```

### 2. Color Scheme

**Light Mode:**
- Background: `bg-slate-50`, `bg-white`
- Text: `text-slate-900`, `text-slate-700`, `text-slate-600`
- Borders: `border-slate-200`
- Interactive: `hover:bg-slate-100`

**Dark Mode:**
- Background: `dark:bg-slate-900`, `dark:bg-slate-800`
- Text: `dark:text-slate-100`, `dark:text-slate-300`, `dark:text-slate-400`
- Borders: `dark:border-slate-700`
- Interactive: `dark:hover:bg-slate-700`, `dark:hover:bg-slate-600`

### 3. Component Patterns

**Sidebar/Cards:**
```tsx
className="bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700"
```

**Form elements:**
```tsx
className="bg-white border-slate-200 text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
```

**Navigation:**
```tsx
className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
```

## i18n Integration

### Text Dictionary

**File:** `lib/i18n.ts`

```typescript
// Vietnamese
theme: {
  label: "Giao diện",
  light: "Sáng", 
  dark: "Tối",
  switchToLight: "Chuyển sang giao diện sáng",
  switchToDark: "Chuyển sang giao diện tối",
}

// English  
theme: {
  label: "Theme",
  light: "Light",
  dark: "Dark", 
  switchToLight: "Switch to light theme",
  switchToDark: "Switch to dark theme",
}
```

### Usage in Components

```tsx
const t = getMessages(locale);

<ThemeSwitcher 
  lightLabel={t.theme.light}
  darkLabel={t.theme.dark}
/>
```

## Updated Components

Các component đã được cập nhật với dark mode support:

### Core Components
- `components/app-header.tsx` - header với theme switcher
- `components/language-switcher.tsx` - dropdown styling
- `components/logout-button.tsx` - button styling

### Platform Components  
- `components/platform/dashboard-shell.tsx` - sidebar, main content
- Navigation links và form elements

### Layout
- `app/layout.tsx` - global body styling

## Development Guidelines

### 1. Thêm Dark Mode cho Component Mới

Khi tạo component mới, luôn thêm dark mode styles:

```tsx
// ❌ Không đủ
className="bg-white text-slate-900"

// ✅ Đầy đủ
className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
```

### 2. Testing Dark Mode

- Test cả light và dark mode
- Kiểm tra contrast đủ accessible
- Verify storage persistence
- Test system preference detection

### 3. Hydration Safety

Luôn sử dụng `mounted` state để tránh hydration mismatch:

```tsx
if (!mounted) {
  return <SkeletonLoader />;
}
```

## Troubleshooting

### 1. Theme Không Persist
- Kiểm tra localStorage có hoạt động
- Verify ThemeProvider được wrap đúng

### 2. Hydration Mismatch
- Đảm bảo dùng `mounted` state
- Check ThemeProvider placement in layout

### 3. Styling Bị Missing
- Verify TailwindCSS config có `darkMode: 'class'`
- Check component có đủ dark: classes

### 4. System Detection Không Hoạt Động
- Browser cần support `prefers-color-scheme`
- Check JavaScript có được enable

## Performance Notes

- Theme switching là instant (không có animation để tối ưu performance)
- localStorage được access minimal (chỉ khi mount và toggle)
- CSS classes được apply via TailwindCSS (atomic CSS, optimal)
- Không có runtime CSS generation

## Future Enhancements

Có thể mở rộng:
- Multiple themes (không chỉ light/dark)
- Custom color schemes per platform
- Sync theme across tabs
- Animation transitions
- Auto schedule (light trong ngày, dark ban đêm)