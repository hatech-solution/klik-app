export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export function persistAuthTokens(tokens: AuthTokens) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

  const cookieDomain = resolveCookieDomain(window.location.hostname);
  setCookie(ACCESS_TOKEN_KEY, tokens.accessToken, cookieDomain);
  setCookie(REFRESH_TOKEN_KEY, tokens.refreshToken, cookieDomain);
}

export function getClientAuthTokens(): AuthTokens | null {
  if (typeof window === "undefined") {
    return null;
  }

  const accessTokenFromCookie = getCookieValue(ACCESS_TOKEN_KEY);
  const refreshTokenFromCookie = getCookieValue(REFRESH_TOKEN_KEY);
  if (accessTokenFromCookie && refreshTokenFromCookie) {
    return {
      accessToken: accessTokenFromCookie,
      refreshToken: refreshTokenFromCookie,
    };
  }

  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

function resolveCookieDomain(hostname: string) {
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    return "localhost";
  }

  const segments = hostname.split(".");
  if (segments.length <= 2) {
    return hostname;
  }

  return segments.slice(-2).join(".");
}

function setCookie(name: string, value: string, domain: string) {
  const encoded = encodeURIComponent(value);
  document.cookie = `${name}=${encoded}; path=/; domain=${domain}; max-age=86400; samesite=lax`;
}

function getCookieValue(name: string) {
  const encodedName = `${name}=`;
  const entries = document.cookie.split(";");
  for (const entry of entries) {
    const trimmed = entry.trim();
    if (!trimmed.startsWith(encodedName)) {
      continue;
    }
    return decodeURIComponent(trimmed.slice(encodedName.length));
  }
  return null;
}
