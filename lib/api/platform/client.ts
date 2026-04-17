import { getApiBaseUrl } from "@/lib/api-base";
import { ApiClientError } from "@/lib/api/error";

import type { ApiPlatformRow } from "./types";

export async function fetchPlatforms(accessToken: string): Promise<ApiPlatformRow[]> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/platforms`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    throw new ApiClientError("UNAUTHORIZED", "Unauthorized", 401);
  }

  if (!response.ok) {
    throw new ApiClientError("HTTP_ERROR", "Failed to load platforms", response.status);
  }

  const raw = await response.json();
  if (!Array.isArray(raw)) {
    throw new ApiClientError("INVALID_RESPONSE", "Invalid platforms response");
  }

  return raw as ApiPlatformRow[];
}
