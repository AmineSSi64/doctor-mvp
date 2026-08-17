import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { AppointmentStatusBadge } from "@/components/appointments/status-badge";
import { formatTime } from "@/lib/utils";
import type { AppointmentStatus } from "@prisma/client";

interface ScheduleAppointment {
  id: string;
  scheduledAt: Date | string;
  durationMinutes: number;
  status: AppointmentStatus;
  patient: { id: string; firstName: string; lastName: string };
}

export function TodaySchedule({ appointments }: { appointments: ScheduleAppointment[] }) {
  return (
    <ul className="divide-y divide-border">
      {appointments.map((appt, i) => (
        <li
          key={appt.id}
          className="group animate-fade-in-up"
          style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
        >
          <Link
            href={`/patients/${appt.patient.id}`}
            className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors duration-200 hover:bg-primary-soft/40"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="w-14 shrink-0 font-mono text-sm font-medium text-ink-muted">
                {formatTime(appt.scheduledAt)}
              </span>
              <Avatar firstName={appt.patient.firstName} lastName={appt.patient.lastName} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {appt.patient.firstName} {appt.patient.lastName}
                </p>
                <p className="text-xs text-ink-muted">{appt.durationMinutes} min</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <AppointmentStatusBadge status={appt.status} />
              <ChevronRight className="h-4 w-4 text-ink-soft opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
