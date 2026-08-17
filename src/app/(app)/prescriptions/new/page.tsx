import { notFound } from "next/navigation";
import { getConsultation } from "@/server/services/consultationService";
import { listMedications } from "@/server/services/prescriptionService";
import { PrescriptionForm } from "@/features/prescriptions/prescription-form";
import { Alert } from "@/components/ui/alert";
import { initials } from "@/lib/utils";

export default async function NewPrescriptionPage({
  searchParams,
}: {
  searchParams: { consultationId?: string };
}) {
  if (!searchParams.consultationId) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 md:px-8 md:py-8">
        <Alert tone="warning">
          A prescription must be created from a specific consultation. Open a patient&apos;s
          profile, go to the Consultations tab, and choose &quot;Add Prescription&quot;.
        </Alert>
      </div>
    );
  }

  const consultation = await getConsultation(searchParams.consultationId);
  if (!consultation) notFound();

  const medications = await listMedications();
  const diagnosisLabel = consultation.customDiagnosis || consultation.diagnosis.name;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">New Prescription</h1>
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
            {initials(consultation.patient.firstName, consultation.patient.lastName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">
              {consultation.patient.firstName} {consultation.patient.lastName}
            </p>
            <p className="text-xs text-ink-soft">{diagnosisLabel}</p>
          </div>
        </div>
      </div>
      <PrescriptionForm
        consultationId={consultation.id}
        patientId={consultation.patientId}
        medications={medications}
      />
    </div>
  );
}
