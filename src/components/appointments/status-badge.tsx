import { Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Badge, statusTone } from "@/components/ui/badge";
import { APPOINTMENT_STATUS_LABEL } from "@/lib/utils";
import type { AppointmentStatus } from "@prisma/client";

const STATUS_ICON: Record<AppointmentStatus, typeof Clock> = {
  SCHEDULED: Clock,
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
  NO_SHOW: AlertTriangle,
};

/**
 * The one place appointment status is rendered — icon + tinted background +
 * colored text, one consistent pairing per status (blue/Scheduled,
 * green/Completed, red/Cancelled, amber/No-show) so a doctor scanning a
 * table recognizes the status by shape and color before reading the word.
 */
export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const Icon = STATUS_ICON[status];
  return (
    <Badge tone={statusTone(status)}>
      <Icon className="h-3 w-3" strokeWidth={2.5} />
      {APPOINTMENT_STATUS_LABEL[status]}
    </Badge>
  );
}
