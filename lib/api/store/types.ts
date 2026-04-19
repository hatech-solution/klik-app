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
