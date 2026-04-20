import type { PublicBookingCalendarViewMode } from "@/lib/api/store/types";

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
        code: 41004 | 41005;
        message_key: string;
        suggested_slots?: Array<{ start_at: string; end_at: string }>;
      };
    };

const MOCK_COURSES: BookingRuntimeCourse[] = [
  { id: "course_design_cut", name: "Design cut", duration_minutes: 60, price: 5500, is_active: true },
  { id: "course_color", name: "Hair color", duration_minutes: 90, price: 7500, is_active: true },
  { id: "course_treatment", name: "Treatment", duration_minutes: 45, price: 4500, is_active: true },
];

const MOCK_STAFFS: BookingRuntimeStaff[] = [
  {
    id: "staff_sato",
    name: "Sato",
    is_active: true,
    course_ids: ["course_design_cut", "course_treatment"],
  },
  {
    id: "staff_yui",
    name: "Yui",
    is_active: true,
    course_ids: ["course_design_cut", "course_color"],
  },
  {
    id: "staff_ken",
    name: "Ken",
    is_active: true,
    course_ids: ["course_color"],
  },
];

const bookingAttemptsByIdempotency = new Map<string, number>();
const blockedStartAtByStore = new Map<string, Set<string>>();

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseDateOnly(input: string): Date {
  const [year, month, day] = input.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addMinutes(date: Date, mins: number): Date {
  return new Date(date.getTime() + mins * 60 * 1000);
}

function toIsoLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${mins}:00+09:00`;
}

function hash(input: string): number {
  let value = 0;
  for (let i = 0; i < input.length; i += 1) {
    value = (value * 31 + input.charCodeAt(i)) % 2147483647;
  }
  return value;
}

export async function getPublicBookingRuntimeInit(storeId: string): Promise<BookingRuntimeInitResponse> {
  await wait(220);
  const seed = hash(storeId);
  const mode: PublicBookingCalendarViewMode = seed % 2 === 0 ? "month" : "week";

  return {
    store: {
      id: storeId,
      name: `Hari Alice #${storeId}`,
      timezone: "Asia/Tokyo",
      currency_code: "JPY",
    },
    settings: {
      calendar_view_mode: mode,
      slot_step_minutes: 30,
      require_course_on_booking: true,
      require_staff_on_booking: true,
      default_duration_when_no_course: null,
    },
    courses: MOCK_COURSES,
    staffs: MOCK_STAFFS,
  };
}

export async function getPublicBookingRuntimeSlots(params: {
  store_id: string;
  timezone: string;
  from_date: string;
  to_date: string;
  course_id: string | null;
  staff_id: string | null;
  slot_step_minutes: number;
  duration_minutes: number;
}): Promise<BookingRuntimeSlotsResponse> {
  await wait(180);

  const fromDate = parseDateOnly(params.from_date);
  const toDate = parseDateOnly(params.to_date);
  const blocked = blockedStartAtByStore.get(params.store_id) ?? new Set<string>();

  const slots: BookingRuntimeSlot[] = [];
  for (let day = new Date(fromDate); day <= toDate; day.setDate(day.getDate() + 1)) {
    const dayOfWeek = day.getDay();
    for (let hour = 10; hour <= 18; hour += 1) {
      for (let minute = 0; minute < 60; minute += params.slot_step_minutes) {
        if (hour === 18 && minute > 0) continue;
        const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute, 0, 0);
        const end = addMinutes(start, params.duration_minutes);
        const startAt = toIsoLocal(start);
        const endAt = toIsoLocal(end);
        const isLunchBreak = hour === 13 && (minute === 0 || minute === 30);
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const seeded = hash(
          `${params.store_id}:${params.course_id ?? "none"}:${params.staff_id ?? "none"}:${formatDateOnly(day)}:${hour}:${minute}`,
        );
        const baseAvailable = isWeekend ? seeded % 100 < 42 : seeded % 100 < 70;
        const available = baseAvailable && !isLunchBreak && !blocked.has(startAt);
        slots.push({
          start_at: startAt,
          end_at: endAt,
          status: available ? "available" : "unavailable",
        });
      }
    }
  }

  return {
    timezone: params.timezone,
    from_date: params.from_date,
    to_date: params.to_date,
    slots,
  };
}

export async function postPublicBookingRuntime(
  payload: CreateBookingRuntimePayload,
): Promise<CreateBookingRuntimeResponse> {
  await wait(320);
  if (!payload.start_at || !payload.customer.name.trim() || !payload.customer.phone_number.trim()) {
    return {
      ok: false,
      error: {
        code: 41005,
        message_key: "booking.error.invalid_payload",
      },
    };
  }

  const previousAttempts = bookingAttemptsByIdempotency.get(payload.idempotency_key) ?? 0;
  bookingAttemptsByIdempotency.set(payload.idempotency_key, previousAttempts + 1);

  if (previousAttempts === 0) {
    const blocked = blockedStartAtByStore.get(payload.store_id) ?? new Set<string>();
    blocked.add(payload.start_at);
    blockedStartAtByStore.set(payload.store_id, blocked);

    const selectedDate = payload.start_at.slice(0, 10);
    const suggestions = await getPublicBookingRuntimeSlots({
      store_id: payload.store_id,
      timezone: payload.timezone,
      from_date: selectedDate,
      to_date: selectedDate,
      course_id: payload.course_id,
      staff_id: payload.staff_id,
      slot_step_minutes: 30,
      duration_minutes: 60,
    });

    return {
      ok: false,
      error: {
        code: 41004,
        message_key: "booking.error.slot_unavailable",
        suggested_slots: suggestions.slots
          .filter((slot) => slot.status === "available")
          .slice(0, 3)
          .map((slot) => ({ start_at: slot.start_at, end_at: slot.end_at })),
      },
    };
  }

  return {
    ok: true,
    booking_id: `bk_${hash(`${payload.store_id}:${payload.idempotency_key}:${payload.start_at}`)}`,
  };
}
