import { notFound } from "next/navigation";
import { getPatientProfile } from "@/server/services/patientService";
import { PatientForm } from "@/features/patients/patient-form";
import { PageHeader } from "@/components/ui/page-header";

export default async function EditPatientPage({ params }: { params: { id: string } }) {
  const patient = await getPatientProfile(params.id);
  if (!patient) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <PageHeader title="Edit Patient" description={`${patient.firstName} ${patient.lastName}`} />
      <PatientForm patient={patient} />
    </div>
  );
}
