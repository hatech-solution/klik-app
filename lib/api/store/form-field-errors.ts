import { getErrorMessageByKey, type ApiClientError } from "@/lib/api/error";

export type StoreFormField =
  | "name"
  | "address"
  | "phone"
  | "email"
  | "description"
  | "youtubeUrl"
  | "facebookUrl"
  | "googleMapUrl"
  | "websiteUrl";

const API_FIELD_TO_FORM: Record<string, StoreFormField | undefined> = {
  name: "name",
  address: "address",
  phone_number: "phone",
  email: "email",
  description: "description",
  youtube_url: "youtubeUrl",
  facebook_url: "facebookUrl",
  google_map_url: "googleMapUrl",
  website_url: "websiteUrl",
};

export function buildStoreFormFieldErrors(
  error: ApiClientError,
  resolveMessage: (messageKey: string) => string | undefined,
): Partial<Record<StoreFormField, string>> {
  const out: Partial<Record<StoreFormField, string>> = {};
  for (const fe of error.fieldErrors ?? []) {
    const formField = API_FIELD_TO_FORM[fe.field];
    if (!formField || out[formField]) {
      continue;
    }
    const msg =
      resolveMessage(fe.messageKey) ??
      (error.messageKey ? resolveMessage(error.messageKey) : undefined) ??
      fe.messageKey;
    out[formField] = msg;
  }
  return out;
}

export function resolveStoreSubmitErrors(
  error: ApiClientError,
  errorByKey: Record<string, string>,
  fixHighlighted: string,
  unexpected: string,
): { banner: string; fieldErrors: Partial<Record<StoreFormField, string>> } {
  const fieldErrors = buildStoreFormFieldErrors(error, (k) => errorByKey[k]);
  const banner =
    Object.keys(fieldErrors).length > 0
      ? fixHighlighted
      : getErrorMessageByKey(error, unexpected, errorByKey);
  return { banner, fieldErrors };
}
