import { getApiBaseUrl } from "@/lib/api-base";
import type { AuthTokens } from "@/lib/auth-tokens";

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
  if (!response.ok) {
    throw new Error(extractErrorMessage(body, "Login failed"));
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
  if (!response.ok) {
    throw new Error(extractErrorMessage(body, "Register failed"));
  }

  return mapAuthPayload(body);
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const maybeError = (payload as { error?: unknown }).error;
  if (typeof maybeError === "string" && maybeError.trim().length > 0) {
    return maybeError;
  }

  return fallback;
}
