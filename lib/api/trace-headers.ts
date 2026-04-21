/** HTTP header name aligned with klik-server middleware. */
export const TRACE_ID_HEADER = "X-Trace-Id";

const SESSION_STORAGE_KEY = "klik_trace_id";

function newTraceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tr_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/**
 * One trace id per browser tab (sessionStorage) so all API calls in the tab correlate.
 * Server may still normalize or replace; response header X-Trace-Id is the canonical id when present.
 */
export function getOrCreateClientTraceId(): string {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    let id = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!id) {
      id = newTraceId();
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return newTraceId();
  }
}

/** Merge trace header into a flat header map for fetch(). */
export function withTraceHeaders(headers: Record<string, string> = {}): Record<string, string> {
  const id = getOrCreateClientTraceId();
  if (!id) {
    return { ...headers };
  }
  return { ...headers, [TRACE_ID_HEADER]: id };
}
