import { getApiBaseUrl } from "@/lib/api-base";
import { withTraceHeaders } from "@/lib/api/trace-headers";
import type { AuthTokens } from "@/lib/auth-tokens";
import {
  ApiClientError,
  toApiClientError,
} from "@/lib/api/error";

import { mapAuthPayload } from "./mapper";
import type { LoginRequest, RefreshTokenRequest, RegisterRequest } from "./types";

function jsonHeaders(): Record<string, string> {
  return withTraceHeaders({
    "Content-Type": "application/json",
  });
}

export async function loginWithApi(payload: LoginRequest): Promise<AuthTokens> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);
  if (response.status === 401) {
    throw new ApiClientError("UNAUTHORIZED", "Unauthorized", 401);
  }
  if (!response.ok) {
    throw toApiClientError(body, "Login failed", response.status);
  }

  return mapAuthPayload(body);
}

export async function registerWithApi(payload: RegisterRequest): Promise<AuthTokens> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/register`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);
  if (response.status === 401) {
    throw new ApiClientError("UNAUTHORIZED", "Unauthorized", 401);
  }
  if (!response.ok) {
    throw toApiClientError(body, "Register failed", response.status);
  }

  return mapAuthPayload(body);
}

export async function refreshWithApi(payload: RefreshTokenRequest): Promise<AuthTokens> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/refresh`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);
  if (response.status === 401) {
    throw new ApiClientError("UNAUTHORIZED", "Unauthorized", 401);
  }
  if (!response.ok) {
    throw toApiClientError(body, "Refresh token failed", response.status);
  }

  return mapAuthPayload(body);
}
