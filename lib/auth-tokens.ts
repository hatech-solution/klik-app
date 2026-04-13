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

  const cookieDomains = resolveCookieDomains(window.location.hostname);
  for (const domain of cookieDomains) {
    setCookie(ACCESS_TOKEN_KEY, tokens.accessToken, domain);
    setCookie(REFRESH_TOKEN_KEY, tokens.refreshToken, domain);
  }
  // Host-only cookie fallback.
  setCookie(ACCESS_TOKEN_KEY, tokens.accessToken);
  setCookie(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearAuthTokens() {
  if (typeof window === "undefined") {
    return;
  }

  const cookieDomains = resolveCookieDomains(window.location.hostname);
  for (const domain of cookieDomains) {
    deleteCookie(ACCESS_TOKEN_KEY, domain);
    deleteCookie(REFRESH_TOKEN_KEY, domain);
  }

  // Also clear host-only cookies if they exist.
  deleteCookie(ACCESS_TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);
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
  return null;
}

function resolveCookieDomains(hostname: string) {
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    // In local dev, different browsers handle localhost domains differently,
    // so we set both variants for better subdomain compatibility.
    return [".localhost", "localhost"];
  }

  const segments = hostname.split(".");
  if (segments.length <= 2) {
    return [hostname];
  }

  return [`.${segments.slice(-2).join(".")}`];
}

function setCookie(name: string, value: string, domain?: string) {
  const encoded = encodeURIComponent(value);
  const domainPart = domain ? `; domain=${domain}` : "";
  document.cookie = `${name}=${encoded}; path=/${domainPart}; max-age=86400; samesite=lax`;
}

function deleteCookie(name: string, domain?: string) {
  const domainPart = domain ? `; domain=${domain}` : "";
  document.cookie = `${name}=; path=/${domainPart}; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
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
