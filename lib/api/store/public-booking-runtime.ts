import { ApiClientError, toApiClientError } from "@/lib/api/error";
import type { PublicBookingCalendarViewMode } from "@/lib/api/store/types";
import { getApiBaseUrl } from "@/lib/api-base";
import { withTraceHeaders } from "@/lib/api/trace-headers";

export type BookingRuntimeCourse = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number | null;
  is_active: boolean;
};

export type BookingRuntimeStaff = {
  id: string;
  name: string;
  is_active: boolean;
  course_ids: string[];
};

export type BookingRuntimeInitResponse = {
  store: {
    id: string;
    name: string;
    timezone: string;
    currency_code: string;
    platform_id: string;
  };
  settings: {
    calendar_view_mode: PublicBookingCalendarViewMode;
    slot_step_minutes: number;
    require_course_on_booking: boolean;
    require_staff_on_booking: boolean;
    default_duration_when_no_course: number | null;
  };
  courses: BookingRuntimeCourse[];
  staffs: BookingRuntimeStaff[];
};

export type BookingRuntimeSlot = {
  start_at: string;
  end_at: string;
  status: "available" | "unavailable";
};

export type BookingRuntimeSlotsResponse = {
  timezone: string;
  from_date: string;
  to_date: string;
  effective_duration_minutes: number;
  slot_step_minutes: number;
  calendar_view_mode: PublicBookingCalendarViewMode;
  slots: BookingRuntimeSlot[];
};

export type CreateBookingRuntimePayload = {
  store_id: string;
  idempotency_key: string;
  course_id: string | null;
  staff_id: string | null;
  start_at: string;
  timezone: string;
  customer: {
    name: string;
    phone_number: string;
    note: string | null;
  };
};

export type CreateBookingRuntimeResponse =
  | { ok: true; booking_id: string }
  | {
      ok: false;
      error: {
        code: number;
        message_key: string;
        suggested_slots?: Array<{ start_at: string; end_at: string }>;
      };
    };

type CreateBookingRuntimeError = Extract<CreateBookingRuntimeResponse, { ok: false }>["error"];

export async function getPublicBookingRuntimeInit(storeId: string): Promise<BookingRuntimeInitResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/public/stores/${storeId}/booking/init`, {
    method: "GET",
    cache: "no-store",
    headers: withTraceHeaders({
      Accept: "application/json",
    }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to load public booking init", response.status);
  }
  return body as BookingRuntimeInitResponse;
}

export async function getPublicBookingRuntimeSlots(params: {
  store_id: string;
  from_date: string;
  to_date: string;
  course_id: string | null;
  staff_id: string | null;
}): Promise<BookingRuntimeSlotsResponse> {
  const query = new URLSearchParams({
    from_date: params.from_date,
    to_date: params.to_date,
  });
  if (params.course_id) {
    query.set("course_id", params.course_id);
  }
  if (params.staff_id) {
    query.set("staff_id", params.staff_id);
  }
  const response = await fetch(
    `${getApiBaseUrl()}/api/v1/public/stores/${params.store_id}/booking/slots?${query.toString()}`,
    {
      method: "GET",
      cache: "no-store",
      headers: withTraceHeaders({
        Accept: "application/json",
      }),
    },
  );
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiClientError(body, "Failed to load public booking slots", response.status);
  }
  return body as BookingRuntimeSlotsResponse;
}

function parseCreateBookingRuntimeError(payload: unknown): CreateBookingRuntimeError {
  if (!payload || typeof payload !== "object") {
    return {
      code: 41099,
      message_key: "booking.error.internal",
    };
  }
  const rawError = (payload as { error?: unknown }).error;
  if (!rawError || typeof rawError !== "object") {
    return {
      code: 41099,
      message_key: "booking.error.internal",
    };
  }
  const typedError = rawError as {
    code?: unknown;
    message_key?: unknown;
    suggested_slots?: unknown;
  };
  const suggestedSlots = Array.isArray(typedError.suggested_slots)
    ? typedError.suggested_slots
        .map((slot) => {
          if (!slot || typeof slot !== "object") {
            return null;
          }
          const item = slot as { start_at?: unknown; end_at?: unknown };
          if (typeof item.start_at !== "string" || typeof item.end_at !== "string") {
            return null;
          }
          return { start_at: item.start_at, end_at: item.end_at };
        })
        .filter((slot): slot is { start_at: string; end_at: string } => slot !== null)
    : undefined;

  return {
    code: typeof typedError.code === "number" ? typedError.code : 41099,
    message_key:
      typeof typedError.message_key === "string"
        ? typedError.message_key
        : "booking.error.internal",
    suggested_slots: suggestedSlots,
  };
}

export async function postPublicBookingRuntime(
  payload: CreateBookingRuntimePayload,
): Promise<CreateBookingRuntimeResponse> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/public/stores/${payload.store_id}/bookings`, {
      method: "POST",
      headers: withTraceHeaders({
        Accept: "application/json",
        "Content-Type": "application/json",
        "Idempotency-Key": payload.idempotency_key,
      }),
      body: JSON.stringify({
        course_id: payload.course_id,
        staff_id: payload.staff_id,
        start_at: payload.start_at,
        timezone: payload.timezone,
        customer: payload.customer,
      }),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        ok: false,
        error: parseCreateBookingRuntimeError(body),
      };
    }
    return {
      ok: true,
      booking_id: (body as { booking_id?: string }).booking_id ?? "",
    };
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    return {
      ok: false,
      error: {
        code: 41099,
        message_key: "booking.error.internal",
      },
    };
  }
}
