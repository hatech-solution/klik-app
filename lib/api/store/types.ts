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

export type StaffHoursScope = "inherit_store" | "custom";

export type StaffApiItem = {
  id: string;
  store_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  price: number | null;
  max_bookings_per_slot: number | null;
  primary_image: string | null;
  gallery_images: string[];
  description: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateStaffPayload = {
  name: string;
  description: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  price?: number | null;
  max_bookings_per_slot?: number | null;
  primary_image?: string | null;
  gallery_images?: string[];
  sort_order?: number | null;
  is_visible?: boolean | null;
};

export type UpdateStaffPayload = CreateStaffPayload;

export type StaffSettingsApiItem = {
  store_id: string;
  require_staff_on_booking: boolean;
  hide_staff_price_on_public: boolean;
  max_concurrent_staff_bookings_per_slot: number | null;
};

export type PutStaffSettingsPayload = {
  require_staff_on_booking: boolean;
  hide_staff_price_on_public: boolean;
  max_concurrent_staff_bookings_per_slot?: number | null;
};

export type CourseApiItem = {
  id: string;
  store_id: string;
  name: string;
  description: string;
  duration_estimate_minutes: number;
  primary_image: string | null;
  gallery_images: string[];
  price: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CreateCoursePayload = {
  name: string;
  description: string;
  duration_estimate_minutes: number;
  primary_image?: string | null;
  gallery_images?: string[];
  price?: number | null;
  sort_order?: number | null;
};

export type UpdateCoursePayload = CreateCoursePayload;

export type CourseSettingsApiItem = {
  store_id: string;
  require_course_on_booking: boolean;
  hide_course_price_on_public: boolean;
  show_course_duration_on_public: boolean;
  default_duration_when_no_course: number | null;
};

export type PutCourseSettingsPayload = {
  require_course_on_booking: boolean;
  hide_course_price_on_public: boolean;
  show_course_duration_on_public: boolean;
  default_duration_when_no_course?: number | null;
};

export type PublicBookingCalendarViewMode = "month" | "week";

export type PublicBookingSettingsApiItem = {
  store_id: string;
  calendar_view_mode: PublicBookingCalendarViewMode;
  slot_step_hours: number;
  slot_step_minutes: number;
  url_booking_complete: string | null;
  url_booking_updated: string | null;
  url_booking_cancelled: string | null;
};

export type PutPublicBookingSettingsPayload = {
  calendar_view_mode: PublicBookingCalendarViewMode;
  slot_step_hours: number;
  slot_step_minutes: number;
  url_booking_complete?: string | null;
  url_booking_updated?: string | null;
  url_booking_cancelled?: string | null;
};

export type StaffCourseLinksApiItem = {
  staff_id: string;
  staff_covers_all_courses: boolean;
  course_ids: string[];
};

export type PutStaffCourseLinksPayload = {
  staff_covers_all_courses: boolean;
  course_ids: string[];
};

export type StaffOperatingHoursResponse = {
  staff_id: string;
  store_id: string;
  hours_scope: StaffHoursScope;
  configured: boolean;
  timezone: string;
  hours_mode?: StoreHoursMode;
  holiday_fallback_day_kind?: StoreHolidayFallbackDayKind;
  weekday_rules: StoreWeekdayRule[];
  calendar_overrides: StoreCalendarOverride[] | null;
};

export type PutStaffOperatingHoursPayload =
  | { hours_scope: "inherit_store" }
  | ({
      hours_scope: "custom";
    } & PutStoreOperatingHoursPayload);

export type StaffOperatingHoursResolveResponse = {
  staff_id: string;
  store_id: string;
  timezone: string;
  hours_scope: StaffHoursScope;
  date_from: string;
  date_to: string;
  days: StoreOperatingHoursResolvedDay[];
};
