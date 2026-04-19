import type { StoreApiItem } from "@/lib/api/store/types";
import type { Store, StoreBusinessStatus, StoreVerificationStatus } from "@/lib/types/store";

export function mapStoreApiItemToStore(d: StoreApiItem): Store {
  return {
    id: d.id,
    name: d.name,
    regionCode: d.region_code,
    timezone: d.timezone,
    currencyCode: d.currency_code,
    address: d.address,
    phoneNumber: d.phone_number,
    email: d.email,
    description: d.description,
    primaryImageUrl: d.primary_image_url,
    slideImageUrls: d.slide_image_urls,
    youtubeUrl: d.youtube_url,
    facebookUrl: d.facebook_url,
    googleMapUrl: d.google_map_url,
    websiteUrl: d.website_url,
    businessStatus: d.business_status as StoreBusinessStatus,
    verificationStatus: d.verification_status as StoreVerificationStatus,
  };
}
