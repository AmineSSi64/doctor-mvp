import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AmbientRings } from "@/components/ui/ambient-rings";
import { calculateAge, formatDate } from "@/lib/utils";
import { Pencil, Plus, Phone, MapPin, CalendarPlus } from "lucide-react";
import type { getPatientProfile } from "@/server/services/patientService";

type Patient = NonNullable<Awaited<ReturnType<typeof getPatientProfile>>>;

const GENDER_LABEL: Record<string, string> = { M: "Male", F: "Female" };

/**
 * The patient profile's premium header: a real avatar-forward identity
 * panel with an original abstract visual anchor (not a literal medical
 * illustration — see AmbientRings) rather than a plain form-like row of
 * fields.
 */
export function PatientHero({ patient }: { patient: Patient }) {
  return (
    <div className="relative animate-fade-in-up overflow-hidden rounded-xl border border-border bg-surface p-6 shadow-subtle">
      <AmbientRings className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 animate-float-slow" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="animate-scale-in">
            <Avatar firstName={patient.firstName} lastName={patient.lastName} size="xl" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-ink">
                {patient.firstName} {patient.lastName}
              </h1>
              <span className="rounded-pill border border-border bg-bg px-2 py-0.5 font-mono text-xs text-ink-soft">
                {patient.patientCode}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-muted">
              <span>
                {GENDER_LABEL[patient.gender]} · {calculateAge(patient.dateOfBirth)} years
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <Phone className="h-3.5 w-3.5 text-ink-soft" />
                {patient.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-ink-soft" />
                {patient.city}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarPlus className="h-3.5 w-3.5 text-ink-soft" />
                Registered {formatDate(patient.registrationDate)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link href={`/patients/${patient.id}/edit`}>
            <Button variant="secondary" size="sm">
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          </Link>
          <Link href={`/consultations/new?patientId=${patient.id}`}>
            <Button size="sm">
              <Plus className="h-4 w-4" /> New Consultation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
