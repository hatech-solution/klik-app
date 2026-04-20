# Dark Mode Quick Reference

Cheat sheet cho việc implement dark mode styling trong components.

## Color Mapping

### Background Colors
```
Light → Dark
bg-white → dark:bg-slate-800
bg-slate-50 → dark:bg-slate-900
bg-slate-100 → dark:bg-slate-700
```

### Text Colors
```
Light → Dark
text-slate-900 → dark:text-slate-100
text-slate-700 → dark:text-slate-300
text-slate-600 → dark:text-slate-400
text-slate-500 → dark:text-slate-400
```

### Border Colors
```
Light → Dark
border-slate-200 → dark:border-slate-700
border-slate-300 → dark:border-slate-600
border-white/30 → dark:border-slate-600/50
```

### Interactive States
```
Light → Dark
hover:bg-slate-100 → dark:hover:bg-slate-700
hover:bg-slate-200 → dark:hover:bg-slate-600
focus:ring-slate-500 → dark:focus:ring-slate-400
```

## Common Patterns

### Card/Panel
```tsx
className="bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700"
```

### Input/Form
```tsx
className="bg-white border-slate-200 text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
```

### Button Primary
```tsx
className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
```

### Button Secondary  
```tsx
className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
```

### Navigation Link Active
```tsx
className="bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
```

### Navigation Link Inactive
```tsx
className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
```

## Checklist for New Components

- [ ] Background có dark variant
- [ ] Text color có dark variant
- [ ] Border có dark variant
- [ ] Hover/focus states có dark variant
- [ ] Icons/images vẫn readable trong dark mode
- [ ] Contrast ratio đủ accessibility standard

## Testing Dark Mode

```bash
# Test cả 2 modes
yarn build
yarn lint

# Manual test:
# 1. Toggle theme button
# 2. Reload page (check persistence)
# 3. Clear localStorage và check auto-detect
# 4. Test trên mobile/desktop
```