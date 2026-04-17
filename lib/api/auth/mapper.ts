import type { AuthTokens } from "@/lib/auth-tokens";

import type { ApiAuthResponse } from "./types";

export function mapAuthPayload(raw: unknown): AuthTokens {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid response from server");
  }

  const data = raw as ApiAuthResponse;
  if (!data.access_token || !data.refresh_token) {
    throw new Error("Missing auth tokens from server");
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
}
