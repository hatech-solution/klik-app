"use client";

import { useEffect } from "react";

export type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  /** Nút xác nhận: danger = đỏ (xoá), default = slate */
  confirmVariant?: "danger" | "default";
  busy?: boolean;
  /** Nhãn nút xác nhận khi `busy` (ví dụ đang gọi API) */
  busyConfirmLabel?: string;
  errorMessage?: string | null;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmModal({
  open,
  title,
  description,
  cancelLabel,
  confirmLabel,
  confirmVariant = "default",
  busy = false,
  busyConfirmLabel,
  errorMessage,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, busy, onCancel]);

  if (!open) return null;

  const confirmClass =
    confirmVariant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
      : "bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50";

  return (
    <div
      className="dm-modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="presentation"
      onClick={() => {
        if (!busy) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="dm-modal-panel w-full max-w-md p-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-modal-title" className="text-lg font-semibold text-[var(--dm-text)]">
          {title}
        </h3>
        <p className="mt-2 text-sm text-[var(--dm-text-muted)]">{description}</p>
        {errorMessage ? (
          <p className="dm-alert-error dm-alert-tight mt-3">{errorMessage}</p>
        ) : null}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="dm-btn-ghost disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onConfirm()}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${confirmClass}`}
          >
            {busy ? (busyConfirmLabel ?? confirmLabel) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
