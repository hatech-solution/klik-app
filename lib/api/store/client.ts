import { authorizedRequest } from "@/lib/api/authenticated-request";
import { toApiClientError } from "@/lib/api/error";
import type {
  CreateStorePayload,
  PatchStoreStatusPayload,
  PutStoreOperatingHoursPayload,
  RegionApiItem,
  StoreApiItem,
  StoreOperatingHoursResolveResponse,
  StoreOperatingHoursResponse,
  UpdateStorePayload,
} from "./types";

export async function fetchRegions(): Promise<RegionApiItem[]> {
  const response = await authorizedRequest({
    method: "GET",
    path: "/api/v1/regions",
    cache: "no-store",
    includeJsonContentType: false,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to load regions", response.status);
  }

  return body as RegionApiItem[];
}

export async function fetchStores(botId: string): Promise<StoreApiItem[]> {
  const response = await authorizedRequest({
    method: "GET",
    path: "/api/v1/stores",
    extraHeaders: {
      "X-Bot-Id": botId,
    },
    cache: "no-store",
    includeJsonContentType: false,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to load stores", response.status);
  }

  return body as StoreApiItem[];
}

export async function createStore(
  botId: string,
  payload: CreateStorePayload,
): Promise<StoreApiItem> {
  const response = await authorizedRequest({
    method: "POST",
    path: "/api/v1/stores",
    extraHeaders: {
      "X-Bot-Id": botId,
    },
    body: payload,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to create store", response.status);
  }

  return body as StoreApiItem;
}

export async function updateStore(
  botId: string,
  storeId: string,
  payload: UpdateStorePayload,
): Promise<StoreApiItem> {
  const response = await authorizedRequest({
    method: "PUT",
    path: `/api/v1/stores/${storeId}`,
    extraHeaders: {
      "X-Bot-Id": botId,
    },
    body: payload,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to update store", response.status);
  }

  return body as StoreApiItem;
}

export async function patchStoreStatus(
  botId: string,
  storeId: string,
  payload: PatchStoreStatusPayload,
): Promise<StoreApiItem> {
  const response = await authorizedRequest({
    method: "PATCH",
    path: `/api/v1/stores/${storeId}/business-status`,
    extraHeaders: {
      "X-Bot-Id": botId,
    },
    body: payload,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to update store status", response.status);
  }

  return body as StoreApiItem;
}

export async function deleteStore(botId: string, storeId: string): Promise<void> {
  const response = await authorizedRequest({
    method: "DELETE",
    path: `/api/v1/stores/${storeId}`,
    extraHeaders: {
      "X-Bot-Id": botId,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw toApiClientError(body, "Failed to delete store", response.status);
  }
}

export async function fetchStoreOperatingHours(
  botId: string,
  storeId: string,
): Promise<StoreOperatingHoursResponse> {
  const response = await authorizedRequest({
    method: "GET",
    path: `/api/v1/stores/${storeId}/operating-hours`,
    extraHeaders: {
      "X-Bot-Id": botId,
    },
    cache: "no-store",
    includeJsonContentType: false,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to load operating hours", response.status);
  }

  return body as StoreOperatingHoursResponse;
}

export async function putStoreOperatingHours(
  botId: string,
  storeId: string,
  payload: PutStoreOperatingHoursPayload,
): Promise<StoreOperatingHoursResponse> {
  const response = await authorizedRequest({
    method: "PUT",
    path: `/api/v1/stores/${storeId}/operating-hours`,
    extraHeaders: {
      "X-Bot-Id": botId,
    },
    body: payload,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to save operating hours", response.status);
  }

  return body as StoreOperatingHoursResponse;
}

export async function resolveStoreOperatingHours(
  botId: string,
  storeId: string,
  dateFrom: string,
  dateTo: string,
): Promise<StoreOperatingHoursResolveResponse> {
  const q = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
  const response = await authorizedRequest({
    method: "GET",
    path: `/api/v1/stores/${storeId}/operating-hours/resolve?${q.toString()}`,
    extraHeaders: {
      "X-Bot-Id": botId,
    },
    cache: "no-store",
    includeJsonContentType: false,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to resolve operating hours", response.status);
  }

  return body as StoreOperatingHoursResolveResponse;
}
