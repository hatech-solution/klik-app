import { cookies } from "next/headers";

import { ACCESS_TOKEN_KEY, AuthTokens, REFRESH_TOKEN_KEY } from "@/lib/auth-tokens";

export async function getServerAuthTokens(): Promise<AuthTokens | null> {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(ACCESS_TOKEN_KEY)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value;
  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}
