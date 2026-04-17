export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "API_ERROR"
  | "HTTP_ERROR"
  | "INVALID_RESPONSE"
  | "NETWORK_ERROR";

export type ApiFieldError = {
  field: string;
  code: string;
  messageKey: string;
};

export class ApiClientError extends Error {
  code: ApiErrorCode;
  status?: number;
  backendCode?: number;
  messageKey?: string;
  fieldErrors?: ApiFieldError[];

  constructor(
    code: ApiErrorCode,
    message: string,
    status?: number,
    options?: {
      backendCode?: number;
      messageKey?: string;
      fieldErrors?: ApiFieldError[];
    },
  ) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.backendCode = options?.backendCode;
    this.messageKey = options?.messageKey;
    this.fieldErrors = options?.fieldErrors;
  }
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiClientError && error.code === "UNAUTHORIZED";
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    return error.message.trim().length > 0 ? error.message : fallback;
  }
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return fallback;
}

export function getErrorMessageByKey(
  error: unknown,
  fallback: string,
  messagesByKey: Record<string, string>,
): string {
  if (error instanceof ApiClientError) {
    const firstFieldMessageKey = error.fieldErrors?.[0]?.messageKey;
    if (firstFieldMessageKey && messagesByKey[firstFieldMessageKey]) {
      return messagesByKey[firstFieldMessageKey];
    }
    if (error.messageKey && messagesByKey[error.messageKey]) {
      return messagesByKey[error.messageKey];
    }
  }
  return getErrorMessage(error, fallback);
}

type ParsedApiError = {
  backendCode?: number;
  messageKey?: string;
  fieldErrors?: ApiFieldError[];
  message: string;
};

function toFieldErrors(raw: unknown): ApiFieldError[] | undefined {
  if (!Array.isArray(raw)) {
    return undefined;
  }

  const fieldErrors = raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }
      const item = entry as {
        field?: unknown;
        code?: unknown;
        message_key?: unknown;
      };
      if (
        typeof item.field !== "string" ||
        typeof item.code !== "string" ||
        typeof item.message_key !== "string"
      ) {
        return null;
      }
      return {
        field: item.field,
        code: item.code,
        messageKey: item.message_key,
      } satisfies ApiFieldError;
    })
    .filter((item): item is ApiFieldError => item !== null);

  return fieldErrors.length > 0 ? fieldErrors : undefined;
}

export function parseApiError(payload: unknown, fallback: string): ParsedApiError {
  if (!payload || typeof payload !== "object") {
    return { message: fallback };
  }

  const maybeError = (payload as { error?: unknown }).error;
  if (!maybeError) {
    return { message: fallback };
  }

  if (typeof maybeError === "string" && maybeError.trim().length > 0) {
    return { message: maybeError };
  }

  if (typeof maybeError !== "object") {
    return { message: fallback };
  }

  const typedError = maybeError as {
    code?: unknown;
    message_key?: unknown;
    field_errors?: unknown;
  };

  const backendCode = typeof typedError.code === "number" ? typedError.code : undefined;
  const messageKey =
    typeof typedError.message_key === "string" ? typedError.message_key : undefined;
  const fieldErrors = toFieldErrors(typedError.field_errors);

  return {
    backendCode,
    messageKey,
    fieldErrors,
    // FE hiện tại chưa map i18n động theo message_key nên tạm giữ fallback text.
    message: fallback,
  };
}

export function toApiClientError(
  payload: unknown,
  fallback: string,
  status?: number,
): ApiClientError {
  const parsed = parseApiError(payload, fallback);
  return new ApiClientError("API_ERROR", parsed.message, status, {
    backendCode: parsed.backendCode,
    messageKey: parsed.messageKey,
    fieldErrors: parsed.fieldErrors,
  });
}

export function isBackendErrorCode(error: unknown, backendCode: number): boolean {
  return error instanceof ApiClientError && error.backendCode === backendCode;
}

export function getBackendErrorCode(error: unknown): number | undefined {
  if (!(error instanceof ApiClientError)) {
    return undefined;
  }
  return error.backendCode;
}
