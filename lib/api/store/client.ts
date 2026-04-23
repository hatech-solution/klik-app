import { authorizedRequest } from "@/lib/api/authenticated-request";
import { toApiClientError } from "@/lib/api/error";
import type {
  BookingDetailResponse,
  BookingListQuery,
  BookingListResponse,
  BookingSummaryResponse,
  CourseApiItem,
  CourseSettingsApiItem,
  CreateCoursePayload,
  CreateStaffPayload,
  CreateStorePayload,
  PatchStoreStatusPayload,
  PublicBookingSettingsApiItem,
  PutCourseSettingsPayload,
  PutPublicBookingSettingsPayload,
  PutStaffCourseLinksPayload,
  PutStaffOperatingHoursPayload,
  PutStaffSettingsPayload,
  PutStoreOperatingHoursPayload,
  RegionApiItem,
  StaffCourseLinksApiItem,
  StaffApiItem,
  StaffOperatingHoursResolveResponse,
  StaffOperatingHoursResponse,
  StaffSettingsApiItem,
  StoreApiItem,
  StoreOperatingHoursResolveResponse,
  StoreOperatingHoursResponse,
  UpdateBookingStatusPayload,
  UpdateBookingStatusResponse,
  UpdateCoursePayload,
  UpdateStaffPayload,
  UpdateStorePayload,
} from "./types";

export async function fetchRegions(): Promise<RegionApiItem[]> {
  const response = await authorizedRequest({
    method: "GET",
    path: "/api/v1/regions",
    cache: "no-store",
    includeJsonContentType: false,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to load regions", response.status);
  }

  return body as RegionApiItem[];
}

export async function fetchStores(botId: string): Promise<StoreApiItem[]> {
  const response = await authorizedRequest({
    method: "GET",
    path: "/api/v1/stores",
    extraHeaders: {
      "X-Bot-Id": botId,
    },
    cache: "no-store",
    includeJsonContentType: false,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to load stores", response.status);
  }

  return body as StoreApiItem[];
}

export async function createStore(
  botId: string,
  payload: CreateStorePayload,
): Promise<StoreApiItem> {
  const response = await authorizedRequest({
    method: "POST",
    path: "/api/v1/stores",
    extraHeaders: {
      "X-Bot-Id": botId,
    },
    body: payload,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to create store", response.status);
  }

  return body as StoreApiItem;
}

export async function updateStore(
  botId: string,
  storeId: string,
  payload: UpdateStorePayload,
): Promise<StoreApiItem> {
  const response = await authorizedRequest({
    method: "PUT",
    path: `/api/v1/stores/${storeId}`,
    extraHeaders: {
      "X-Bot-Id": botId,
    },
    body: payload,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to update store", response.status);
  }

  return body as StoreApiItem;
}

export async function patchStoreStatus(
  botId: string,
  storeId: string,
  payload: PatchStoreStatusPayload,
): Promise<StoreApiItem> {
  const response = await authorizedRequest({
    method: "PATCH",
    path: `/api/v1/stores/${storeId}/business-status`,
    extraHeaders: {
      "X-Bot-Id": botId,
    },
    body: payload,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to update store status", response.status);
  }

  return body as StoreApiItem;
}

export async function deleteStore(botId: string, storeId: string): Promise<void> {
  const response = await authorizedRequest({
    method: "DELETE",
    path: `/api/v1/stores/${storeId}`,
    extraHeaders: {
      "X-Bot-Id": botId,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw toApiClientError(body, "Failed to delete store", response.status);
  }
}

export async function fetchStoreOperatingHours(
  botId: string,
  storeId: string,
): Promise<StoreOperatingHoursResponse> {
  const response = await authorizedRequest({
    method: "GET",
    path: `/api/v1/stores/${storeId}/operating-hours`,
    extraHeaders: {
      "X-Bot-Id": botId,
    },
    cache: "no-store",
    includeJsonContentType: false,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to load operating hours", response.status);
  }

  return body as StoreOperatingHoursResponse;
}

export async function putStoreOperatingHours(
  botId: string,
  storeId: string,
  payload: PutStoreOperatingHoursPayload,
): Promise<StoreOperatingHoursResponse> {
  const response = await authorizedRequest({
    method: "PUT",
    path: `/api/v1/stores/${storeId}/operating-hours`,
    extraHeaders: {
      "X-Bot-Id": botId,
    },
    body: payload,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to save operating hours", response.status);
  }

  return body as StoreOperatingHoursResponse;
}

export async function resolveStoreOperatingHours(
  botId: string,
  storeId: string,
  dateFrom: string,
  dateTo: string,
): Promise<StoreOperatingHoursResolveResponse> {
  const q = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
  const response = await authorizedRequest({
    method: "GET",
    path: `/api/v1/stores/${storeId}/operating-hours/resolve?${q.toString()}`,
    extraHeaders: {
      "X-Bot-Id": botId,
    },
    cache: "no-store",
    includeJsonContentType: false,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to resolve operating hours", response.status);
  }

  return body as StoreOperatingHoursResolveResponse;
}

export async function fetchCourseList(botId: string, storeId: string): Promise<CourseApiItem[]> {
  const response = await authorizedRequest({
    method: "GET",
    path: `/api/v1/stores/${storeId}/courses`,
    extraHeaders: { "X-Bot-Id": botId },
    cache: "no-store",
    includeJsonContentType: false,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to load courses", response.status);
  }
  return body as CourseApiItem[];
}

export async function createCourse(
  botId: string,
  storeId: string,
  payload: CreateCoursePayload,
): Promise<CourseApiItem> {
  const response = await authorizedRequest({
    method: "POST",
    path: `/api/v1/stores/${storeId}/courses`,
    extraHeaders: { "X-Bot-Id": botId },
    body: payload,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to create course", response.status);
  }
  return body as CourseApiItem;
}

export async function fetchCourse(
  botId: string,
  storeId: string,
  courseId: string,
): Promise<CourseApiItem> {
  const response = await authorizedRequest({
    method: "GET",
    path: `/api/v1/stores/${storeId}/courses/${courseId}`,
    extraHeaders: { "X-Bot-Id": botId },
    cache: "no-store",
    includeJsonContentType: false,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to load course", response.status);
  }
  return body as CourseApiItem;
}

export async function updateCourse(
  botId: string,
  storeId: string,
  courseId: string,
  payload: UpdateCoursePayload,
): Promise<CourseApiItem> {
  const response = await authorizedRequest({
    method: "PUT",
    path: `/api/v1/stores/${storeId}/courses/${courseId}`,
    extraHeaders: { "X-Bot-Id": botId },
    body: payload,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to update course", response.status);
  }
  return body as CourseApiItem;
}

export async function deleteCourse(botId: string, storeId: string, courseId: string): Promise<void> {
  const response = await authorizedRequest({
    method: "DELETE",
    path: `/api/v1/stores/${storeId}/courses/${courseId}`,
    extraHeaders: { "X-Bot-Id": botId },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw toApiClientError(body, "Failed to delete course", response.status);
  }
}

export async function fetchCourseSettings(
  botId: string,
  storeId: string,
): Promise<CourseSettingsApiItem> {
  const response = await authorizedRequest({
    method: "GET",
    path: `/api/v1/stores/${storeId}/course-settings`,
    extraHeaders: { "X-Bot-Id": botId },
    cache: "no-store",
    includeJsonContentType: false,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to load course settings", response.status);
  }
  return body as CourseSettingsApiItem;
}

export async function putCourseSettings(
  botId: string,
  storeId: string,
  payload: PutCourseSettingsPayload,
): Promise<CourseSettingsApiItem> {
  const response = await authorizedRequest({
    method: "PUT",
    path: `/api/v1/stores/${storeId}/course-settings`,
    extraHeaders: { "X-Bot-Id": botId },
    body: payload,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to save course settings", response.status);
  }
  return body as CourseSettingsApiItem;
}

export async function fetchPublicBookingSettings(
  botId: string,
  storeId: string,
): Promise<PublicBookingSettingsApiItem> {
  const response = await authorizedRequest({
    method: "GET",
    path: `/api/v1/stores/${storeId}/public-booking-settings`,
    extraHeaders: { "X-Bot-Id": botId },
    cache: "no-store",
    includeJsonContentType: false,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to load public booking settings", response.status);
  }
  return body as PublicBookingSettingsApiItem;
}

export async function putPublicBookingSettings(
  botId: string,
  storeId: string,
  payload: PutPublicBookingSettingsPayload,
): Promise<PublicBookingSettingsApiItem> {
  const response = await authorizedRequest({
    method: "PUT",
    path: `/api/v1/stores/${storeId}/public-booking-settings`,
    extraHeaders: { "X-Bot-Id": botId },
    body: payload,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to save public booking settings", response.status);
  }
  return body as PublicBookingSettingsApiItem;
}

export async function fetchStaffCourseLinks(
  botId: string,
  storeId: string,
  staffId: string,
): Promise<StaffCourseLinksApiItem> {
  const response = await authorizedRequest({
    method: "GET",
    path: `/api/v1/stores/${storeId}/staff/${staffId}/course-links`,
    extraHeaders: { "X-Bot-Id": botId },
    cache: "no-store",
    includeJsonContentType: false,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to load staff course links", response.status);
  }
  return body as StaffCourseLinksApiItem;
}

export async function putStaffCourseLinks(
  botId: string,
  storeId: string,
  staffId: string,
  payload: PutStaffCourseLinksPayload,
): Promise<StaffCourseLinksApiItem> {
  const response = await authorizedRequest({
    method: "PUT",
    path: `/api/v1/stores/${storeId}/staff/${staffId}/course-links`,
    extraHeaders: { "X-Bot-Id": botId },
    body: payload,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to save staff course links", response.status);
  }
  return body as StaffCourseLinksApiItem;
}

export async function fetchStaffList(botId: string, storeId: string): Promise<StaffApiItem[]> {
  const response = await authorizedRequest({
    method: "GET",
    path: `/api/v1/stores/${storeId}/staff`,
    extraHeaders: { "X-Bot-Id": botId },
    cache: "no-store",
    includeJsonContentType: false,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to load staff", response.status);
  }
  return body as StaffApiItem[];
}

export async function createStaff(
  botId: string,
  storeId: string,
  payload: CreateStaffPayload,
): Promise<StaffApiItem> {
  const response = await authorizedRequest({
    method: "POST",
    path: `/api/v1/stores/${storeId}/staff`,
    extraHeaders: { "X-Bot-Id": botId },
    body: payload,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to create staff", response.status);
  }
  return body as StaffApiItem;
}

export async function fetchStaff(
  botId: string,
  storeId: string,
  staffId: string,
): Promise<StaffApiItem> {
  const response = await authorizedRequest({
    method: "GET",
    path: `/api/v1/stores/${storeId}/staff/${staffId}`,
    extraHeaders: { "X-Bot-Id": botId },
    cache: "no-store",
    includeJsonContentType: false,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to load staff member", response.status);
  }
  return body as StaffApiItem;
}

export async function updateStaff(
  botId: string,
  storeId: string,
  staffId: string,
  payload: UpdateStaffPayload,
): Promise<StaffApiItem> {
  const response = await authorizedRequest({
    method: "PUT",
    path: `/api/v1/stores/${storeId}/staff/${staffId}`,
    extraHeaders: { "X-Bot-Id": botId },
    body: payload,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to update staff", response.status);
  }
  return body as StaffApiItem;
}

export async function deleteStaff(botId: string, storeId: string, staffId: string): Promise<void> {
  const response = await authorizedRequest({
    method: "DELETE",
    path: `/api/v1/stores/${storeId}/staff/${staffId}`,
    extraHeaders: { "X-Bot-Id": botId },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw toApiClientError(body, "Failed to delete staff", response.status);
  }
}

export async function fetchStaffSettings(
  botId: string,
  storeId: string,
): Promise<StaffSettingsApiItem> {
  const response = await authorizedRequest({
    method: "GET",
    path: `/api/v1/stores/${storeId}/staff-settings`,
    extraHeaders: { "X-Bot-Id": botId },
    cache: "no-store",
    includeJsonContentType: false,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to load staff settings", response.status);
  }
  return body as StaffSettingsApiItem;
}

export async function putStaffSettings(
  botId: string,
  storeId: string,
  payload: PutStaffSettingsPayload,
): Promise<StaffSettingsApiItem> {
  const response = await authorizedRequest({
    method: "PUT",
    path: `/api/v1/stores/${storeId}/staff-settings`,
    extraHeaders: { "X-Bot-Id": botId },
    body: payload,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to save staff settings", response.status);
  }
  return body as StaffSettingsApiItem;
}

export async function fetchStaffOperatingHours(
  botId: string,
  storeId: string,
  staffId: string,
): Promise<StaffOperatingHoursResponse> {
  const response = await authorizedRequest({
    method: "GET",
    path: `/api/v1/stores/${storeId}/staff/${staffId}/operating-hours`,
    extraHeaders: { "X-Bot-Id": botId },
    cache: "no-store",
    includeJsonContentType: false,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to load staff hours", response.status);
  }
  return body as StaffOperatingHoursResponse;
}

export async function putStaffOperatingHours(
  botId: string,
  storeId: string,
  staffId: string,
  payload: PutStaffOperatingHoursPayload,
): Promise<StaffOperatingHoursResponse> {
  const response = await authorizedRequest({
    method: "PUT",
    path: `/api/v1/stores/${storeId}/staff/${staffId}/operating-hours`,
    extraHeaders: { "X-Bot-Id": botId },
    body: payload,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to save staff hours", response.status);
  }
  return body as StaffOperatingHoursResponse;
}

export async function resolveStaffOperatingHours(
  botId: string,
  storeId: string,
  staffId: string,
  dateFrom: string,
  dateTo: string,
): Promise<StaffOperatingHoursResolveResponse> {
  const q = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
  const response = await authorizedRequest({
    method: "GET",
    path: `/api/v1/stores/${storeId}/staff/${staffId}/operating-hours/resolve?${q.toString()}`,
    extraHeaders: { "X-Bot-Id": botId },
    cache: "no-store",
    includeJsonContentType: false,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to resolve staff hours", response.status);
  }
  return body as StaffOperatingHoursResolveResponse;
}

// --- Booking Management ---

export async function fetchBookings(
  botId: string,
  storeId: string,
  query: BookingListQuery,
): Promise<BookingListResponse> {
  const params = new URLSearchParams({
    from_date: query.from_date,
    to_date: query.to_date,
  });
  if (query.status) params.set("status", query.status);
  if (query.staff_id) params.set("staff_id", query.staff_id);
  if (query.course_id) params.set("course_id", query.course_id);
  if (query.platform_provider) params.set("platform_provider", query.platform_provider);
  if (query.search) params.set("search", query.search);
  if (query.sort_by) params.set("sort_by", query.sort_by);
  if (query.sort_order) params.set("sort_order", query.sort_order);
  if (query.page) params.set("page", String(query.page));
  if (query.page_size) params.set("page_size", String(query.page_size));

  const response = await authorizedRequest({
    method: "GET",
    path: `/api/v1/stores/${storeId}/bookings?${params.toString()}`,
    extraHeaders: { "X-Bot-Id": botId },
    cache: "no-store",
    includeJsonContentType: false,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to load bookings", response.status);
  }
  return body as BookingListResponse;
}

export async function fetchBookingDetail(
  botId: string,
  storeId: string,
  bookingId: string,
): Promise<BookingDetailResponse> {
  const response = await authorizedRequest({
    method: "GET",
    path: `/api/v1/stores/${storeId}/bookings/${bookingId}`,
    extraHeaders: { "X-Bot-Id": botId },
    cache: "no-store",
    includeJsonContentType: false,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to load booking detail", response.status);
  }
  return body as BookingDetailResponse;
}

export async function updateBookingStatus(
  botId: string,
  storeId: string,
  bookingId: string,
  payload: UpdateBookingStatusPayload,
): Promise<UpdateBookingStatusResponse> {
  const response = await authorizedRequest({
    method: "PATCH",
    path: `/api/v1/stores/${storeId}/bookings/${bookingId}/status`,
    extraHeaders: { "X-Bot-Id": botId },
    body: payload,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to update booking status", response.status);
  }
  return body as UpdateBookingStatusResponse;
}

export async function fetchBookingSummary(
  botId: string,
  storeId: string,
  fromDate: string,
  toDate: string,
): Promise<BookingSummaryResponse> {
  const params = new URLSearchParams({ from_date: fromDate, to_date: toDate });
  const response = await authorizedRequest({
    method: "GET",
    path: `/api/v1/stores/${storeId}/bookings/summary?${params.toString()}`,
    extraHeaders: { "X-Bot-Id": botId },
    cache: "no-store",
    includeJsonContentType: false,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to load booking summary", response.status);
  }
  return body as BookingSummaryResponse;
}
