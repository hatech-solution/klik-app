export type StoreBusinessStatus = "active" | "temporarily_closed" | "stopped_business";
export type StoreVerificationStatus = "verified" | "blocked" | "pending_review";

export type Store = {
  id: string;
  name: string;
  address: string | null;
  phoneNumber: string | null;
  email: string | null;
  description: string | null;
  primaryImageUrl: string | null;
  slideImageUrls: string[];
  youtubeUrl: string | null;
  facebookUrl: string | null;
  googleMapUrl: string | null;
  websiteUrl: string | null;
  businessStatus: StoreBusinessStatus;
  verificationStatus: StoreVerificationStatus;
};
