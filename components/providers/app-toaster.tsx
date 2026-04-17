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
          toast: "rounded-xl border border-slate-200/80 shadow-lg backdrop-blur-sm",
        },
      }}
    />
  );
}
