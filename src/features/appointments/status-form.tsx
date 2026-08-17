"use client";

import { updateAppointmentStatusAction } from "@/features/appointments/actions";
import { APPOINTMENT_STATUS_LABEL } from "@/lib/utils";
import type { AppointmentStatus } from "@prisma/client";

const OPTIONS: AppointmentStatus[] = ["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"];

/**
 * Inline status changer. Submits immediately on change via a Server Action
 * — no separate "save" button needed for a single-field update, but the
 * action itself still re-validates and re-checks the session server-side.
 */
export function AppointmentStatusForm({
  appointmentId,
  currentStatus,
}: {
  appointmentId: string;
  currentStatus: AppointmentStatus;
}) {
  return (
    <form action={updateAppointmentStatusAction}>
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <select
        name="status"
        defaultValue={currentStatus}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="h-8 rounded-md border border-border bg-surface px-2 text-xs text-ink transition-colors hover:border-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        aria-label="Update appointment status"
      >
        {OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {APPOINTMENT_STATUS_LABEL[opt]}
          </option>
        ))}
      </select>
    </form>
  );
}
