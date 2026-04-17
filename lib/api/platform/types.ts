export type ApiPlatformRow = {
  platform_id: string;
  status: string;
};

export type FetchPlatformsResult =
  | { ok: true; data: ApiPlatformRow[] }
  | { ok: false; status: number };
