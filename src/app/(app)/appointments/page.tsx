import Link from "next/link";
import { listAppointments } from "@/server/services/appointmentService";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { AppointmentStatusBadge } from "@/components/appointments/status-badge";
import { AppointmentStatusForm } from "@/features/appointments/status-form";
import { cn, formatDateTime, initials } from "@/lib/utils";
import { Plus, CalendarX2 } from "lucide-react";
import type { AppointmentStatus } from "@prisma/client";

const FILTERS: { label: string; value: AppointmentStatus | "ALL"; dot: string }[] = [
  { label: "All", value: "ALL", dot: "bg-ink-soft" },
  { label: "Scheduled", value: "SCHEDULED", dot: "bg-info" },
  { label: "Completed", value: "COMPLETED", dot: "bg-success" },
  { label: "Cancelled", value: "CANCELLED", dot: "bg-danger" },
  { label: "No-show", value: "NO_SHOW", dot: "bg-warning" },
];

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const statusFilter = (searchParams.status as AppointmentStatus | undefined) ?? undefined;
  const appointments = await listAppointments({ status: statusFilter });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        title="Appointments"
        description={`${appointments.length} shown`}
        actions={
          <Link href="/appointments/new">
            <Button size="sm">
              <Plus className="h-4 w-4" /> New Appointment
            </Button>
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "ALL" ? "/appointments" : `/appointments?status=${f.value}`}
            className={cn(
              "flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-xs font-medium transition-colors",
              (statusFilter ?? "ALL") === f.value
                ? "border-primary bg-primary-soft text-primary"
                : "border-border text-ink-muted hover:bg-bg"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", f.dot)} />
            {f.label}
          </Link>
        ))}
      </div>

      <Card>
        <CardBody className="p-0">
          {appointments.length === 0 ? (
            <EmptyState
              icon={CalendarX2}
              title="No appointments found"
              description="Create an appointment to see it here."
              action={
                <Link href="/appointments/new">
                  <Button size="sm">
                    <Plus className="h-4 w-4" /> Create Appointment
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-soft">
                    <th className="px-5 py-3 font-medium">Date &amp; Time</th>
                    <th className="px-5 py-3 font-medium">Patient</th>
                    <th className="px-5 py-3 font-medium">Doctor</th>
                    <th className="px-5 py-3 font-medium">Duration</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {appointments.map((a) => (
                    <tr key={a.id} className="transition-colors hover:bg-bg">
                      <td className="px-5 py-3 font-mono text-ink-muted">
                        {formatDateTime(a.scheduledAt)}
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/patients/${a.patientId}`}
                          className="flex items-center gap-2 font-medium text-ink hover:text-primary"
                        >
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-soft text-[10px] font-semibold text-primary">
                            {initials(a.patient.firstName, a.patient.lastName)}
                          </span>
                          {a.patient.firstName} {a.patient.lastName}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-ink-muted">
                        Dr. {a.doctor.firstName} {a.doctor.lastName}
                      </td>
                      <td className="px-5 py-3 text-ink-muted">{a.durationMinutes} min</td>
                      <td className="px-5 py-3">
                        <AppointmentStatusBadge status={a.status} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end">
                          <AppointmentStatusForm appointmentId={a.id} currentStatus={a.status} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
