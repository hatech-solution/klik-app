export type StoreApiItem = {
  id: string;
  bot_id: string;
  created_by: string;
  updated_by: string;
  name: string;
  primary_image_url: string | null;
  slide_image_urls: string[];
  address: string | null;
  phone_number: string | null;
  email: string | null;
  youtube_url: string | null;
  facebook_url: string | null;
  google_map_url: string | null;
  website_url: string | null;
  business_status: string;
  verification_status: string;
  description: string | null;
  region_code: string;
  timezone: string;
  currency_code: string;
  created_at: string;
  updated_at: string;
};

export type RegionApiItem = {
  region_code: string;
  default_timezone: string;
  default_currency: string;
};

export type CreateStorePayload = {
  name: string;
  primary_image_url?: string | null;
  slide_image_urls?: string[];
  address?: string | null;
  phone_number?: string | null;
  email?: string | null;
  youtube_url?: string | null;
  facebook_url?: string | null;
  google_map_url?: string | null;
  website_url?: string | null;
  business_status?: string;
  description?: string | null;
  region_code?: string | null;
  timezone?: string | null;
  currency_code?: string | null;
};

export type UpdateStorePayload = CreateStorePayload;

export type PatchStoreStatusPayload = {
  business_status: string;
};

export type StoreHoursMode = "weekly_common" | "by_weekday";

export type StoreHolidayFallbackDayKind = "closed" | "inherit_weekday" | "open_24h";

export type StoreDayKind = "closed" | "open_24h" | "segments";

export type StoreOperatingHoursSegment = {
  start: string;
  end: string;
  is_overnight: boolean;
};

export type StoreWeekdayRule = {
  weekday: number;
  day_kind: StoreDayKind;
  segments: StoreOperatingHoursSegment[];
};

export type StoreCalendarOverride = {
  calendar_date: string;
  day_kind: StoreDayKind;
  segments: StoreOperatingHoursSegment[];
};

export type StoreOperatingHoursResponse = {
  store_id: string;
  configured: boolean;
  hours_mode: StoreHoursMode;
  holiday_fallback_day_kind: StoreHolidayFallbackDayKind;
  timezone: string;
  weekday_rules: StoreWeekdayRule[];
  calendar_overrides: StoreCalendarOverride[];
};

export type PutStoreOperatingHoursPayload = {
  hours_mode: StoreHoursMode;
  holiday_fallback_day_kind: StoreHolidayFallbackDayKind;
  weekday_rules: StoreWeekdayRule[];
  calendar_overrides?: StoreCalendarOverride[];
};

export type StoreOperatingHoursResolvedDay = {
  calendar_date: string;
  resolution_source: string;
  day_kind: StoreDayKind;
  segments?: StoreOperatingHoursSegment[];
};

export type StoreOperatingHoursResolveResponse = {
  store_id: string;
  timezone: string;
  date_from: string;
  date_to: string;
  days: StoreOperatingHoursResolvedDay[];
};
