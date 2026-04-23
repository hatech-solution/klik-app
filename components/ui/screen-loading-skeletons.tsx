import { Skeleton } from "@/components/ui/skeleton";

type LoadingRegionProps = {
  "aria-label": string;
  busy?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function LoadingRegion({ "aria-label": ariaLabel, busy = true, children, className = "" }: LoadingRegionProps) {
  return (
    <div aria-busy={busy} aria-label={ariaLabel} className={className} role="status">
      {children}
    </div>
  );
}

export function SelectPlatformGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="select-platform-skeleton-card rounded-2xl border p-6 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="mt-3 space-y-1.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-[85%]" />
          </div>
          <Skeleton className="mt-4 h-4 w-44" />
        </div>
      ))}
    </div>
  );
}

type StoreTableSkeletonProps = {
  rows?: number;
};

export function StoreTableSkeleton({ rows = 7 }: StoreTableSkeletonProps) {
  return (
    <div className="overflow-x-auto" aria-hidden>
      <table className="w-full min-w-[720px] text-left">
        <thead className="dm-thead">
          <tr>
            {Array.from({ length: 7 }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--dm-border)]">
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-36" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-28" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-44" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-6 w-20 rounded-full" />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardShellBotsSkeleton() {
  return (
    <div className="space-y-3 py-2" aria-hidden>
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-4 w-full max-w-xs" />
    </div>
  );
}

export function DashboardShellRedirectSkeleton() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-8" aria-hidden>
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

export function BotSelectCardSkeleton() {
  return (
    <div
      className="dm-skel-bot-card flex h-[240px] w-56 flex-col justify-between rounded-[20px] border p-5 shadow-sm"
      aria-hidden
    >
      <div className="flex w-full justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <Skeleton className="h-[88px] w-[88px] rounded-full" />
      </div>
      <div className="space-y-2 pb-1">
        <Skeleton className="mx-auto h-4 w-28" />
        <Skeleton className="mx-auto h-3 w-16" />
      </div>
    </div>
  );
}

export function StoreFormPageSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      {/* Back link + Title */}
      <div>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-3 h-7 w-48" />
      </div>

      <div className="flex max-w-2xl flex-col gap-4">
        {/* Store Name */}
        <div>
          <Skeleton className="mb-1 h-3 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        {/* Image Section */}
        <div className="dm-well space-y-4">
          <Skeleton className="h-4 w-36" />
          {/* Primary image */}
          <div>
            <Skeleton className="mb-1 h-3 w-28" />
            <Skeleton className="mt-3 h-40 w-full rounded-md" />
            <div className="mt-2 flex gap-3">
              <Skeleton className="h-8 w-32 rounded-lg" />
            </div>
          </div>
          {/* Slide images */}
          <div>
            <Skeleton className="mb-1 h-3 w-24" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Skeleton className="h-28 w-full rounded-md" />
              <Skeleton className="h-28 w-full rounded-md" />
            </div>
            <div className="mt-2 flex gap-3">
              <Skeleton className="h-8 w-36 rounded-lg" />
              <Skeleton className="h-3 w-28 self-center" />
            </div>
          </div>
        </div>

        {/* Booking Locale Section */}
        <div className="dm-well">
          <Skeleton className="mb-3 h-4 w-36" />
          <Skeleton className="mb-1 h-3 w-20" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="mt-1 h-3 w-48" />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Skeleton className="mb-1 h-3 w-20" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="mb-1 h-3 w-20" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <Skeleton className="mb-1 h-3 w-16" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        {/* Phone + Email */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Skeleton className="mb-1 h-3 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="mb-1 h-3 w-16" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>

        {/* Description */}
        <div>
          <Skeleton className="mb-1 h-3 w-20" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>

        {/* Social URLs 2x2 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Skeleton className="mb-1 h-3 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="mb-1 h-3 w-28" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Skeleton className="mb-1 h-3 w-28" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="mb-1 h-3 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Skeleton className="h-10 w-20 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function StoreSettingsGateBodySkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      {/* Store name + subtitle */}
      <div>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>

      {/* Analytics stats grid */}
      <div>
        <Skeleton className="mb-4 h-5 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="dm-stat-card h-24 rounded-xl">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="mt-3 h-6 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Modules grid */}
      <div>
        <Skeleton className="h-5 w-28" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="dm-overview-panel flex flex-col border border-[var(--dm-border)]">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-1 h-3 w-[70%]" />
              <Skeleton className="mt-4 h-4 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Timezone footer */}
      <Skeleton className="h-3 w-64" />
    </div>
  );
}

export function StoreOperatingHoursBodySkeleton() {
  return (
    <div className="space-y-6 py-2" aria-hidden>
      {/* Intro section */}
      <div className="border-b border-[var(--dm-border)] pb-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
        <Skeleton className="mt-1 h-3 w-40" />
      </div>

      {/* Mode selection: Hours Mode + Holiday Fallback */}
      <div className="dm-oh-section">
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[200px]">
            <Skeleton className="mb-1 h-3 w-24" />
            <Skeleton className="h-9 w-44 rounded-lg" />
            <Skeleton className="mt-1 h-3 w-full max-w-xs" />
          </div>
          <div className="min-w-[200px]">
            <Skeleton className="mb-1 h-3 w-32" />
            <Skeleton className="h-9 w-44 rounded-lg" />
            <Skeleton className="mt-1 h-3 w-full max-w-xs" />
          </div>
        </div>
      </div>

      {/* Schedule section - weekday rows */}
      <div className="dm-oh-block space-y-3">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-4 w-28 shrink-0" />
            <Skeleton className="h-9 w-36 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="mx-1 h-3 w-3" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Overrides section */}
      <div className="dm-oh-block space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>

      {/* Preview section */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-9 w-36 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap justify-end gap-3 border-t border-[var(--dm-border)] pt-4">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function StorePublicBookingSettingsBodySkeleton() {
  return (
    <div className="space-y-5" aria-hidden>
      {/* Calendar View Mode */}
      <div>
        <Skeleton className="mb-1 h-3 w-28" />
        <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
      </div>

      {/* Slot Step: Hours + Minutes */}
      <div>
        <Skeleton className="mb-1 h-3 w-24" />
        <div className="grid max-w-lg gap-3 sm:grid-cols-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <Skeleton className="mt-1 h-3 w-full max-w-md" />
      </div>

      {/* URL Callback Fields */}
      <div className="grid gap-4">
        <div>
          <Skeleton className="mb-1 h-3 w-40" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div>
          <Skeleton className="mb-1 h-3 w-36" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div>
          <Skeleton className="mb-1 h-3 w-40" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <Skeleton className="h-3 w-full max-w-lg" />
      </div>

      {/* Save button */}
      <div>
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function StoreCourseFormSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6" aria-hidden>
      {/* Header: Title + Back link */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-20" />
      </div>

      <section className="dm-overview-panel space-y-4">
        {/* Name */}
        <div>
          <Skeleton className="mb-1 h-3 w-28" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        {/* Description (textarea) */}
        <div>
          <Skeleton className="mb-1 h-3 w-36" />
          <Skeleton className="h-20 min-h-20 w-full rounded-lg" />
        </div>
        {/* Duration: Hours + Minutes */}
        <div>
          <Skeleton className="mb-1 h-3 w-24" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <Skeleton className="mt-1 h-3 w-full max-w-sm" />
        </div>
        {/* Price + Sort Order */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Skeleton className="mb-1 h-3 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="mb-1 h-3 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        {/* Primary Image */}
        <div>
          <Skeleton className="mb-1 h-3 w-28" />
          <Skeleton className="h-40 w-full rounded-md" />
          <div className="mt-2 flex gap-3">
            <Skeleton className="h-8 w-32 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
        {/* Gallery Images */}
        <div>
          <Skeleton className="mb-1 h-3 w-24" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Skeleton className="h-28 w-full rounded-md" />
            <Skeleton className="h-28 w-full rounded-md" />
          </div>
          <div className="mt-2 flex gap-3">
            <Skeleton className="h-8 w-36 rounded-lg" />
            <Skeleton className="h-3 w-28 self-center" />
          </div>
        </div>
        {/* Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>
      </section>
    </div>
  );
}

export function StoreStaffFormSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6" aria-hidden>
      {/* Header: Title + Back link */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-20" />
      </div>

      <section className="dm-overview-panel space-y-4">
        {/* Name */}
        <div>
          <Skeleton className="mb-1 h-3 w-28" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        {/* Description (textarea) */}
        <div>
          <Skeleton className="mb-1 h-3 w-36" />
          <Skeleton className="h-20 min-h-20 w-full rounded-lg" />
        </div>
        {/* Address */}
        <div>
          <Skeleton className="mb-1 h-3 w-20" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        {/* Phone + Email */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Skeleton className="mb-1 h-3 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="mb-1 h-3 w-16" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        {/* Price + Max Bookings */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Skeleton className="mb-1 h-3 w-16" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="mb-1 h-3 w-28" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        {/* Primary Image (circular) */}
        <div>
          <Skeleton className="mb-1 h-3 w-28" />
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-2">
            <Skeleton className="h-28 w-28 rounded-full" />
          </div>
          <div className="mt-2 flex gap-3">
            <Skeleton className="h-8 w-32 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
        {/* Gallery Images */}
        <div>
          <Skeleton className="mb-1 h-3 w-24" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Skeleton className="h-28 w-full rounded-md" />
            <Skeleton className="h-28 w-full rounded-md" />
          </div>
          <div className="mt-2 flex gap-3">
            <Skeleton className="h-8 w-36 rounded-lg" />
            <Skeleton className="h-3 w-28 self-center" />
          </div>
        </div>
        {/* Sort Order + Visibility checkbox */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Skeleton className="mb-1 h-3 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <Skeleton className="h-4 w-4 rounded-sm" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        {/* Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>
      </section>
    </div>
  );
}

export function StoreManagementPageSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <div className="dm-table-wrap overflow-hidden rounded-xl">
        <div className="p-4 sm:p-6">
          <StoreTableSkeleton />
        </div>
      </div>
    </div>
  );
}

export function RouteGuardSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-6" aria-hidden>
      <Skeleton className="h-14 w-14 rounded-2xl" />
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[85%]" />
        <Skeleton className="h-3 w-[60%]" />
      </div>
    </div>
  );
}

export function PublicBookingRuntimePageSkeleton() {
  return (
    <div className="dm-page-muted min-h-screen pb-24 pt-3" aria-hidden>
      <main className="mx-auto max-w-[430px] space-y-3 px-3">
        {/* Step trail */}
        <section className="dm-overview-panel !rounded-md !px-3 !py-1.5">
          <div className="flex w-full items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, idx) => (
              <span key={idx} className="inline-flex items-center gap-1">
                <Skeleton className="h-3 w-12" />
                {idx < 4 ? <Skeleton className="h-3 w-2" /> : null}
              </span>
            ))}
          </div>
        </section>

        {/* Step 1: Course selection */}
        <section className="dm-overview-panel rounded-2xl p-4">
          <Skeleton className="h-4 w-28" />
          <div className="mt-3 space-y-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="rounded-lg border border-(--dm-border) px-3 py-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-14 w-14 shrink-0 rounded-md" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="mt-1.5 h-3 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[430px] border-t border-(--dm-border) bg-(--dm-surface) px-3 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function BookingListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-hidden>
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-[var(--dm-border)] bg-[var(--dm-surface)] p-3 text-center"
          >
            <Skeleton className="mx-auto h-3 w-16" />
            <Skeleton className="mx-auto mt-2 h-6 w-10" />
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-7 w-14 rounded" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-7 w-14 rounded" />
        <Skeleton className="h-7 w-24 rounded" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[var(--dm-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--dm-border)] bg-[var(--dm-surface)]">
              <th className="px-3 py-2"><Skeleton className="h-4 w-20" /></th>
              <th className="px-3 py-2"><Skeleton className="h-4 w-24" /></th>
              <th className="hidden px-3 py-2 sm:table-cell"><Skeleton className="h-4 w-16" /></th>
              <th className="hidden px-3 py-2 md:table-cell"><Skeleton className="h-4 w-20" /></th>
              <th className="px-3 py-2"><Skeleton className="h-4 w-20" /></th>
              <th className="px-3 py-2"><Skeleton className="h-4 w-16" /></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="border-b border-[var(--dm-border)] last:border-b-0">
                <td className="px-3 py-2"><Skeleton className="h-4 w-28" /></td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-4 w-8 rounded" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </td>
                <td className="hidden px-3 py-2 sm:table-cell"><Skeleton className="h-4 w-20" /></td>
                <td className="hidden px-3 py-2 md:table-cell"><Skeleton className="h-4 w-20" /></td>
                <td className="px-3 py-2"><Skeleton className="h-5 w-20 rounded-full" /></td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-1">
                    <Skeleton className="h-5 w-14 rounded" />
                    <Skeleton className="h-5 w-10 rounded" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-12 rounded" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-12 rounded" />
        </div>
      </div>
    </div>
  );
}

type PublicBookingRuntimeSlotsSkeletonProps = {
  viewMode: "week" | "month";
};

export function PublicBookingRuntimeSlotsSkeleton({ viewMode }: PublicBookingRuntimeSlotsSkeletonProps) {
  if (viewMode === "month") {
    return (
      <div className="space-y-2" aria-hidden>
        <div className="mb-2 flex items-center justify-between">
          <Skeleton className="h-8 w-12 rounded-md" />
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-8 w-12 rounded-md" />
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, idx) => (
            <Skeleton key={`weekday-${idx}`} className="h-4 rounded" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, idx) => (
            <Skeleton key={`day-${idx}`} className="h-12 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2" aria-hidden>
      <div className="mb-2 flex items-center justify-between">
        <Skeleton className="h-8 w-12 rounded-md" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-12 rounded-md" />
      </div>
      <div className="grid grid-cols-8 gap-1">
        {Array.from({ length: 8 }).map((_, idx) => (
          <Skeleton key={`week-header-${idx}`} className="h-10 rounded-md" />
        ))}
      </div>
      <div className="space-y-1">
        {Array.from({ length: 6 }).map((_, rowIdx) => (
          <div key={`week-row-${rowIdx}`} className="grid grid-cols-8 gap-1">
            {Array.from({ length: 8 }).map((_, colIdx) => (
              <Skeleton key={`week-cell-${rowIdx}-${colIdx}`} className="h-8 rounded-md" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
