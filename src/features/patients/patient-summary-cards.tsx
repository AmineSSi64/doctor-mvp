import { MetricCard } from "@/components/ui/metric-card";
import { formatDate } from "@/lib/utils";
import { Stethoscope, CalendarClock, ClipboardList, Pill, CalendarPlus } from "lucide-react";
import type { getPatientProfile } from "@/server/services/patientService";

type Patient = NonNullable<Awaited<ReturnType<typeof getPatientProfile>>>;

/**
 * Five real, derivable metrics from data already loaded on the profile
 * query — nothing here is a fabricated analytic. `patient.appointments`/
 * `consultations`/`prescriptions` are already fetched by
 * getPatientProfile(), so this reads from what's in memory rather than
 * issuing new queries.
 */
export function PatientSummaryCards({ patient }: { patient: Patient }) {
  const lastConsultation = patient.consultations[0];

  const now = new Date();
  const nextAppointment = patient.appointments
    .filter((a) => a.status === "SCHEDULED" && new Date(a.scheduledAt) >= now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];

  const recentPrescription = patient.prescriptions[0];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <MetricCard
        icon={Stethoscope}
        tone="primary"
        label="Last consultation"
        value={lastConsultation ? formatDate(lastConsultation.consultedAt) : "—"}
        style={{ animationDelay: "0ms" }}
      />
      <MetricCard
        icon={CalendarClock}
        tone="info"
        label="Next appointment"
        value={nextAppointment ? formatDate(nextAppointment.scheduledAt) : "—"}
        style={{ animationDelay: "50ms" }}
      />
      <MetricCard
        icon={ClipboardList}
        tone="success"
        label="Total consultations"
        value={patient.consultations.length}
        style={{ animationDelay: "100ms" }}
      />
      <MetricCard
        icon={Pill}
        tone="accent"
        label="Recent prescription"
        value={recentPrescription ? `${recentPrescription.items.length} med${recentPrescription.items.length === 1 ? "" : "s"}` : "—"}
        meta={recentPrescription ? formatDate(recentPrescription.issuedAt) : undefined}
        style={{ animationDelay: "150ms" }}
      />
      <MetricCard
        icon={CalendarPlus}
        tone="neutral"
        label="Patient since"
        value={formatDate(patient.registrationDate)}
        style={{ animationDelay: "200ms" }}
      />
    </div>
  );
}
