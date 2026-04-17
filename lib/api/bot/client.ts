import { getApiBaseUrl } from "@/lib/api-base";
import { getAuthorizedHeaders } from "@/lib/api/authenticated-headers";
import {
  ApiClientError,
  parseApiErrorMessage,
} from "@/lib/api/error";

import type { BotApiItem, UpsertBotPayload } from "./types";

export async function listBotsApi(
  platformId: string,
): Promise<BotApiItem[]> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/bots`, {
    method: "GET",
    headers: getAuthorizedHeaders({
      extraHeaders: { "X-Platform-Id": platformId },
    }),
    cache: "no-store",
  });

  const body = await response.json().catch(() => null);
  if (response.status === 401) {
    throw new ApiClientError("UNAUTHORIZED", "Unauthorized", 401);
  }
  if (!response.ok) {
    throw new ApiClientError(
      "HTTP_ERROR",
      parseApiErrorMessage(body, "Failed to load bots"),
      response.status,
    );
  }
  if (!Array.isArray(body)) {
    throw new ApiClientError("INVALID_RESPONSE", "Invalid bots response");
  }

  return body as BotApiItem[];
}

export async function createBotApi(
  platformId: string,
  payload: UpsertBotPayload,
): Promise<BotApiItem> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/bots`, {
    method: "POST",
    headers: getAuthorizedHeaders({
      extraHeaders: { "X-Platform-Id": platformId },
    }),
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);
  if (response.status === 401) {
    throw new ApiClientError("UNAUTHORIZED", "Unauthorized", 401);
  }
  if (!response.ok) {
    throw new ApiClientError(
      "HTTP_ERROR",
      parseApiErrorMessage(body, "Failed to create bot"),
      response.status,
    );
  }
  if (!body || typeof body !== "object") {
    throw new ApiClientError("INVALID_RESPONSE", "Invalid create bot response");
  }

  return body as BotApiItem;
}

export async function updateBotApi(
  botId: string,
  payload: UpsertBotPayload,
): Promise<BotApiItem> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/bots/${botId}`, {
    method: "PUT",
    headers: getAuthorizedHeaders(),
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);
  if (response.status === 401) {
    throw new ApiClientError("UNAUTHORIZED", "Unauthorized", 401);
  }
  if (!response.ok) {
    throw new ApiClientError(
      "HTTP_ERROR",
      parseApiErrorMessage(body, "Failed to update bot"),
      response.status,
    );
  }
  if (!body || typeof body !== "object") {
    throw new ApiClientError("INVALID_RESPONSE", "Invalid update bot response");
  }

  return body as BotApiItem;
}

export async function deactivateBotApi(botId: string): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/bots/${botId}/deactivate`, {
    method: "PATCH",
    headers: getAuthorizedHeaders(),
  });

  const body = await response.json().catch(() => null);
  if (response.status === 401) {
    throw new ApiClientError("UNAUTHORIZED", "Unauthorized", 401);
  }
  if (!response.ok) {
    throw new ApiClientError(
      "HTTP_ERROR",
      parseApiErrorMessage(body, "Failed to deactivate bot"),
      response.status,
    );
  }

}
