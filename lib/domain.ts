import { PlatformId, isPlatformId } from "@/lib/platforms";

export function stripPort(host: string): string {
  return host.split(":")[0] ?? host;
}

export function extractSubdomain(host: string): string | null {
  const hostname = stripPort(host);

  if (hostname === "localhost") {
    return null;
  }

  if (hostname.endsWith(".localhost")) {
    const subdomain = hostname.replace(".localhost", "");
    return subdomain.length > 0 ? subdomain : null;
  }

  const segments = hostname.split(".");
  if (segments.length <= 2) {
    return null;
  }

  return segments[0] ?? null;
}

export function resolvePlatformFromHost(host: string): PlatformId | null {
  const subdomain = extractSubdomain(host);
  if (!subdomain || !isPlatformId(subdomain)) {
    return null;
  }

  return subdomain;
}

export function buildPlatformUrl(
  platform: PlatformId,
  host: string,
  protocol: string,
  pathname = "",
): string {
  const hostname = stripPort(host);
  const port = host.includes(":") ? `:${host.split(":")[1]}` : "";
  const normalizedPathname =
    pathname.length > 0
      ? pathname.startsWith("/")
        ? pathname
        : `/${pathname}`
      : "";

  if (hostname === "localhost") {
    return `${protocol}://${platform}.localhost${port}${normalizedPathname}`;
  }

  const segments = hostname.split(".");
  if (segments.length <= 2) {
    return `${protocol}://${platform}.${hostname}${port}${normalizedPathname}`;
  }

  const rootDomain = segments.slice(-2).join(".");
  return `${protocol}://${platform}.${rootDomain}${port}${normalizedPathname}`;
}

export function buildMainAppUrl(
  host: string,
  protocol: string,
  pathname = "",
): string {
  const hostname = stripPort(host);
  const port = host.includes(":") ? `:${host.split(":")[1]}` : "";
  const normalizedPathname =
    pathname.length > 0
      ? pathname.startsWith("/")
        ? pathname
        : `/${pathname}`
      : "";

  const platform = resolvePlatformFromHost(host);
  if (!platform) {
    return `${protocol}://${hostname}${port}${normalizedPathname}`;
  }

  if (hostname.endsWith(".localhost")) {
    return `${protocol}://localhost${port}${normalizedPathname}`;
  }

  const segments = hostname.split(".");
  const rootHostname =
    segments.length > 2 ? segments.slice(1).join(".") : hostname;
  return `${protocol}://${rootHostname}${port}${normalizedPathname}`;
}
