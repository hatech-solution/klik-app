import {
  isPlatformId,
  PLATFORM_CONFIGS,
  PLATFORM_IDS,
  type PlatformConfig,
  type PlatformId,
} from "@/lib/platforms";

import type { ApiPlatformRow } from "./types";

/**
 * Maps GET /api/v1/platforms rows to UI configs: only `active` platforms whose
 * `platform_id` exists in PLATFORM_CONFIGS, in stable PLATFORM_IDS order.
 */
export function mapApiPlatformsToConfigs(rows: ApiPlatformRow[]): PlatformConfig[] {
  const activeIds = new Set<PlatformId>();
  for (const row of rows) {
    if (row.status !== "active") {
      continue;
    }
    if (!isPlatformId(row.platform_id)) {
      continue;
    }
    activeIds.add(row.platform_id);
  }

  return PLATFORM_IDS.filter((id) => activeIds.has(id)).map((id) => PLATFORM_CONFIGS[id]);
}
