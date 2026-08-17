import { notFound } from "next/navigation";
import { getPatientProfile, listPatientOptions } from "@/server/services/patientService";
import { listDiagnoses } from "@/server/services/consultationService";
import { listConvertibleAppointments } from "@/server/services/appointmentService";
import { ConsultationForm } from "@/features/consultations/consultation-form";
import { initials, calculateAge } from "@/lib/utils";

export default async function NewConsultationPage({
  searchParams,
}: {
  searchParams: { patientId?: string };
}) {
  if (!searchParams.patientId) {
    // Consultations are always created from a specific patient's context —
    // show a patient picker instead of a bare (and error-prone) empty form.
    const patients = await listPatientOptions();
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 md:px-8 md:py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">New Consultation</h1>
          <p className="mt-1 text-sm text-ink-muted">Choose a patient to begin.</p>
        </div>
        <PatientPicker patients={patients} />
      </div>
    );
  }

  const patient = await getPatientProfile(searchParams.patientId);
  if (!patient) notFound();

  const [diagnoses, convertibleAppointments] = await Promise.all([
    listDiagnoses(),
    listConvertibleAppointments(patient.id),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">New Consultation</h1>
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
            {initials(patient.firstName, patient.lastName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">
              {patient.firstName} {patient.lastName}
            </p>
            <p className="font-mono text-xs text-ink-soft">
              {patient.patientCode} · {calculateAge(patient.dateOfBirth)} years
            </p>
          </div>
        </div>
      </div>
      <ConsultationForm
        patientId={patient.id}
        diagnoses={diagnoses}
        appointments={convertibleAppointments}
      />
    </div>
  );
}

function PatientPicker({
  patients,
}: {
  patients: { id: string; firstName: string; lastName: string; patientCode: string }[];
}) {
  return (
    <form action="/consultations/new" method="get" className="flex gap-2">
      <select
        name="patientId"
        required
        defaultValue=""
        className="h-10 flex-1 rounded-md border border-border bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <option value="" disabled>
          Select a patient
        </option>
        {patients.map((p) => (
          <option key={p.id} value={p.id}>
            {p.firstName} {p.lastName} ({p.patientCode})
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="h-10 shrink-0 rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
      >
        Continue
      </button>
    </form>
  );
}
