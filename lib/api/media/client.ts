import { authorizedRequest } from "@/lib/api/authenticated-request";
import { toApiClientError } from "@/lib/api/error";
import type {
  CreateMediaUploadAuthPayload,
  ImageKitUploadResponse,
  MediaUploadAuthResponse,
} from "@/lib/api/media/types";

const IMAGEKIT_UPLOAD_API = "https://upload.imagekit.io/api/v1/files/upload";

export async function createMediaUploadAuth(
  botId: string,
  payload: CreateMediaUploadAuthPayload,
): Promise<MediaUploadAuthResponse> {
  const response = await authorizedRequest({
    method: "POST",
    path: "/api/v1/media/upload-auth",
    extraHeaders: {
      "X-Bot-Id": botId,
    },
    body: payload,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to create upload auth", response.status);
  }

  return body as MediaUploadAuthResponse;
}

export async function uploadImageToImageKit(
  auth: MediaUploadAuthResponse,
  file: File,
): Promise<ImageKitUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name || `upload-${Date.now()}`);
  formData.append("publicKey", auth.public_key);
  formData.append("token", auth.token);
  formData.append("signature", auth.signature);
  formData.append("expire", String(auth.expire));
  formData.append("folder", auth.folder);
  formData.append("useUniqueFileName", auth.use_unique_file_name ? "true" : "false");

  const response = await fetch(IMAGEKIT_UPLOAD_API, {
    method: "POST",
    body: formData,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body || typeof body.url !== "string") {
    throw new Error("Failed to upload image");
  }

  return body as ImageKitUploadResponse;
}
