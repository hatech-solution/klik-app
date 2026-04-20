"use client";

import { Toaster } from "sonner";

/**
 * Sonner: toast success/error/loading toàn app.
 * Đặt trong root layout (một lần), gọi `notifySuccess` / `notifyError` từ client components.
 */
export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4200}
      gap={10}
      visibleToasts={4}
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border border-[var(--dm-border)] bg-[var(--dm-surface)]/95 text-[var(--dm-text)] shadow-lg backdrop-blur-sm",
        },
      }}
    />
  );
}
