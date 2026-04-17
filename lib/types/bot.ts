import type { PlatformId } from "@/lib/platforms";

export type BotStatus = "verifying" | "active" | "failed" | "deactivated";

export type BotCredentials = Record<string, unknown>;

export type Bot = {
  id: string;
  name: string;
  platformId: PlatformId;
  status: BotStatus;
  credentials: BotCredentials;
  externalName: string | null;
};
