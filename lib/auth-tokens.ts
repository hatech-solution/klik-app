export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

type AuthTokens = {
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
