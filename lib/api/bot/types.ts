import type { BotCredentials, BotStatus } from "@/lib/types/bot";

export type BotApiItem = {
  id: string;
  user_id: string;
  platform_id: string;
  name: string;
  external_name: string | null;
  status: BotStatus;
  credentials: BotCredentials;
  error_message: string | null;
  created_at: string;
};

export type UpsertBotPayload = {
  name: string;
  credentials: BotCredentials;
};
