import { getApiBaseUrl } from "@/lib/api-base";

import type { BotApiItem, UpsertBotPayload } from "./types";

function authHeaders(accessToken: string): HeadersInit {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

export async function listBotsApi(accessToken: string): Promise<BotApiItem[]> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/bots`, {
    method: "GET",
    headers: authHeaders(accessToken),
    cache: "no-store",
  });

  const body = await response.json().catch(() => null);
  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!response.ok) {
    throw new Error(extractErrorMessage(body, "Failed to load bots"));
  }
  if (!Array.isArray(body)) {
    throw new Error("Invalid bots response");
  }

  return body as BotApiItem[];
}

export async function createBotApi(
  accessToken: string,
  platformId: string,
  payload: UpsertBotPayload,
): Promise<BotApiItem> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/bots`, {
    method: "POST",
    headers: {
      ...authHeaders(accessToken),
      "X-Platform-Id": platformId,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);
  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!response.ok) {
    throw new Error(extractErrorMessage(body, "Failed to create bot"));
  }
  if (!body || typeof body !== "object") {
    throw new Error("Invalid create bot response");
  }

  return body as BotApiItem;
}

export async function updateBotApi(
  accessToken: string,
  botId: string,
  payload: UpsertBotPayload,
): Promise<BotApiItem> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/bots/${botId}`, {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);
  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!response.ok) {
    throw new Error(extractErrorMessage(body, "Failed to update bot"));
  }
  if (!body || typeof body !== "object") {
    throw new Error("Invalid update bot response");
  }

  return body as BotApiItem;
}

export async function deactivateBotApi(accessToken: string, botId: string): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/bots/${botId}/deactivate`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
  });

  const body = await response.json().catch(() => null);
  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!response.ok) {
    throw new Error(extractErrorMessage(body, "Failed to deactivate bot"));
  }
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
