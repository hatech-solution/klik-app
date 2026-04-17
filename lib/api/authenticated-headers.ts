import { getClientAuthTokens, isUserLoggedInClient } from "@/lib/auth-tokens";
import { ApiClientError } from "@/lib/api/error";

type AuthHeaderOptions = {
  includeJsonContentType?: boolean;
  extraHeaders?: Record<string, string>;
};

export function getAuthorizedHeaders(options?: AuthHeaderOptions): HeadersInit {
  if (!isUserLoggedInClient()) {
    throw new ApiClientError("UNAUTHORIZED", "Unauthorized", 401);
  }
  const tokens = getClientAuthTokens();
  if (!tokens?.accessToken) {
    throw new ApiClientError("UNAUTHORIZED", "Unauthorized", 401);
  }

  const includeJsonContentType = options?.includeJsonContentType ?? true;
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${tokens.accessToken}`,
    ...(options?.extraHeaders ?? {}),
  };

  if (includeJsonContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}
