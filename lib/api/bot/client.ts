import { authorizedRequest } from "@/lib/api/authenticated-request";
import {
  ApiClientError,
  toApiClientError,
} from "@/lib/api/error";

import type { BotApiItem, UpsertBotPayload } from "./types";

export async function listBotsApi(
  platformId: string,
): Promise<BotApiItem[]> {
  const response = await authorizedRequest({
    method: "GET",
    path: "/api/v1/bots",
    includeJsonContentType: false,
    extraHeaders: { "X-Platform-Id": platformId },
    cache: "no-store",
  });

  const body = await response.json().catch(() => null);
  if (response.status === 401) {
    throw new ApiClientError("UNAUTHORIZED", "Unauthorized", 401);
  }
  if (!response.ok) {
    throw toApiClientError(body, "Failed to load bots", response.status);
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
  const response = await authorizedRequest({
    method: "POST",
    path: "/api/v1/bots",
    extraHeaders: {
      "X-Platform-Id": platformId,
    },
    body: payload,
  });

  const body = await response.json().catch(() => null);
  if (response.status === 401) {
    throw new ApiClientError("UNAUTHORIZED", "Unauthorized", 401);
  }
  if (!response.ok) {
    throw toApiClientError(body, "Failed to create bot", response.status);
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
  const response = await authorizedRequest({
    method: "PUT",
    path: `/api/v1/bots/${botId}`,
    body: payload,
  });

  const body = await response.json().catch(() => null);
  if (response.status === 401) {
    throw new ApiClientError("UNAUTHORIZED", "Unauthorized", 401);
  }
  if (!response.ok) {
    throw toApiClientError(body, "Failed to update bot", response.status);
  }
  if (!body || typeof body !== "object") {
    throw new ApiClientError("INVALID_RESPONSE", "Invalid update bot response");
  }

  return body as BotApiItem;
}

export async function deactivateBotApi(botId: string): Promise<void> {
  const response = await authorizedRequest({
    method: "PATCH",
    path: `/api/v1/bots/${botId}/deactivate`,
  });

  const body = await response.json().catch(() => null);
  if (response.status === 401) {
    throw new ApiClientError("UNAUTHORIZED", "Unauthorized", 401);
  }
  if (!response.ok) {
    throw toApiClientError(body, "Failed to deactivate bot", response.status);
  }

}
