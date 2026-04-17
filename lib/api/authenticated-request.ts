import { getApiBaseUrl } from "@/lib/api-base";
import { refreshWithApi } from "@/lib/api/auth";
import { clearAuthTokens, getClientAuthTokens, persistAuthTokens } from "@/lib/auth-tokens";
import { ApiClientError } from "@/lib/api/error";

type AuthorizedRequestOptions = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  extraHeaders?: Record<string, string>;
  includeJsonContentType?: boolean;
  cache?: RequestCache;
};

export async function authorizedRequest(options: AuthorizedRequestOptions): Promise<Response> {
  const firstResponse = await doAuthorizedFetch(options);
  if (firstResponse.status !== 401) {
    return firstResponse;
  }

  await refreshSessionOrThrow();

  const retriedResponse = await doAuthorizedFetch(options);
  if (retriedResponse.status === 401) {
    clearAuthTokens();
    throw new ApiClientError("UNAUTHORIZED", "Unauthorized", 401);
  }

  return retriedResponse;
}

async function doAuthorizedFetch(options: AuthorizedRequestOptions): Promise<Response> {
  const tokens = getClientAuthTokens();
  if (!tokens?.accessToken) {
    throw new ApiClientError("UNAUTHORIZED", "Unauthorized", 401);
  }

  const includeJsonContentType = options.includeJsonContentType ?? true;
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${tokens.accessToken}`,
    ...(options.extraHeaders ?? {}),
  };
  if (includeJsonContentType) {
    headers["Content-Type"] = "application/json";
  }

  const requestInit: RequestInit = {
    method: options.method,
    headers,
    cache: options.cache,
  };

  if (options.body !== undefined) {
    requestInit.body = JSON.stringify(options.body);
  }

  return fetch(`${getApiBaseUrl()}${options.path}`, requestInit);
}

let refreshingPromise: Promise<void> | null = null;

async function refreshSessionOrThrow(): Promise<void> {
  if (refreshingPromise) {
    return refreshingPromise;
  }

  refreshingPromise = (async () => {
    const tokens = getClientAuthTokens();
    if (!tokens?.refreshToken) {
      clearAuthTokens();
      throw new ApiClientError("UNAUTHORIZED", "Unauthorized", 401);
    }

    try {
      const refreshed = await refreshWithApi({ refresh_token: tokens.refreshToken });
      persistAuthTokens(refreshed);
    } catch (error) {
      clearAuthTokens();
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError("UNAUTHORIZED", "Unauthorized", 401);
    } finally {
      refreshingPromise = null;
    }
  })();

  return refreshingPromise;
}
