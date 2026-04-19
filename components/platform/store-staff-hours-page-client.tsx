"use client";

import { StoreOperatingHoursEditor } from "@/components/platform/store-operating-hours-view";

export function StoreStaffHoursPageClient({ staffId }: { staffId: string }) {
  return <StoreOperatingHoursEditor staffId={staffId} />;
}
