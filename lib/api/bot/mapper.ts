import { isPlatformId } from "@/lib/platforms";
import { ApiClientError } from "@/lib/api/error";
import type { Bot } from "@/lib/types/bot";

import type { BotApiItem } from "./types";

export function mapBotFromApi(item: BotApiItem): Bot {
  if (!isPlatformId(item.platform_id)) {
    throw new ApiClientError(
      "INVALID_RESPONSE",
      `Unsupported platform id: ${item.platform_id}`,
    );
  }

  return {
    id: item.id,
    name: item.name,
    platformId: item.platform_id,
    status: item.status,
    credentials: item.credentials ?? {},
    externalName: item.external_name,
  };
}
