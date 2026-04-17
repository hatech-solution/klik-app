import { getApiBaseUrl } from "@/lib/api-base";

import type { ApiPlatformRow, FetchPlatformsResult } from "./types";

export async function fetchPlatforms(accessToken: string): Promise<FetchPlatformsResult> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/platforms`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    return { ok: false, status: 401 };
  }

  if (!response.ok) {
    return { ok: false, status: response.status };
  }

  const raw = await response.json();
  if (!Array.isArray(raw)) {
    return { ok: false, status: 500 };
  }

  return { ok: true, data: raw as ApiPlatformRow[] };
}
