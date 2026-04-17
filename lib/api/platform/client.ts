import { authorizedRequest } from "@/lib/api/authenticated-request";
import { ApiClientError } from "@/lib/api/error";

import type { ApiPlatformRow } from "./types";

export async function fetchPlatforms(): Promise<ApiPlatformRow[]> {
  const response = await authorizedRequest({
    method: "GET",
    path: "/api/v1/platforms",
    includeJsonContentType: false,
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
