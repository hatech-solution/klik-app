import { getApiBaseUrl } from "@/lib/api-base";

type ApiAuthResponse = {
  access_token: string;
  refresh_token: string;
};

export type AuthPayload = {
  accessToken: string;
  refreshToken: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export async function loginWithApi(payload: LoginRequest): Promise<AuthPayload> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(extractErrorMessage(body, "Login failed"));
  }

  return mapAuthPayload(body);
}

export async function registerWithApi(
  payload: RegisterRequest,
): Promise<AuthPayload> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(extractErrorMessage(body, "Register failed"));
  }

  return mapAuthPayload(body);
}

function mapAuthPayload(raw: unknown): AuthPayload {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid response from server");
  }

  const data = raw as ApiAuthResponse;
  if (!data.access_token || !data.refresh_token) {
    throw new Error("Missing auth tokens from server");
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
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
