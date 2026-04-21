export type MediaUploadScope = "store_primary" | "store_slide";

export type CreateMediaUploadAuthPayload = {
  scope?: MediaUploadScope;
};

export type MediaUploadAuthResponse = {
  public_key: string;
  url_endpoint: string;
  token: string;
  expire: number;
  signature: string;
  folder: string;
  use_unique_file_name: boolean;
};

export type ImageKitUploadResponse = {
  url: string;
  thumbnailUrl?: string;
  fileId?: string;
  name?: string;
};
