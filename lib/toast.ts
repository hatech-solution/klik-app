"use client";

import { toast } from "sonner";

import { ApiClientError, getErrorMessage, getErrorMessageByKey } from "@/lib/api/error";

export function notifySuccess(message: string) {
  toast.success(message);
}

export function notifyError(message: string) {
  toast.error(message);
}

/** Lỗi API: ưu tiên map `message_key` / `field_errors` nếu có `errorByKey`. */
export function notifyApiFailure(
  err: unknown,
  fallback: string,
  errorByKey?: Record<string, string>,
) {
  if (err instanceof ApiClientError && errorByKey) {
    notifyError(getErrorMessageByKey(err, fallback, errorByKey));
    return;
  }
  notifyError(getErrorMessage(err, fallback));
}
