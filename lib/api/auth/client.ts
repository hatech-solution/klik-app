import { getApiBaseUrl } from "@/lib/api-base";
import type { AuthTokens } from "@/lib/auth-tokens";
import {
  ApiClientError,
  parseApiErrorMessage,
} from "@/lib/api/error";

import { mapAuthPayload } from "./mapper";
import type { LoginRequest, RegisterRequest } from "./types";

const JSON_HEADERS: HeadersInit = {
  "Content-Type": "application/json",
};

export async function loginWithApi(payload: LoginRequest): Promise<AuthTokens> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);
  if (response.status === 401) {
    throw new ApiClientError("UNAUTHORIZED", "Unauthorized", 401);
  }
  if (!response.ok) {
    throw new ApiClientError(
      "HTTP_ERROR",
      parseApiErrorMessage(body, "Login failed"),
      response.status,
    );
  }

  return mapAuthPayload(body);
}

export async function registerWithApi(payload: RegisterRequest): Promise<AuthTokens> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/register`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);
  if (response.status === 401) {
    throw new ApiClientError("UNAUTHORIZED", "Unauthorized", 401);
  }
  if (!response.ok) {
    throw new ApiClientError(
      "HTTP_ERROR",
      parseApiErrorMessage(body, "Register failed"),
      response.status,
    );
  }

  return mapAuthPayload(body);
}
