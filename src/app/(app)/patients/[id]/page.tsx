import { notFound } from "next/navigation";
import { getPatientProfile } from "@/server/services/patientService";
import { PatientHero } from "@/features/patients/patient-hero";
import { PatientSummaryCards } from "@/features/patients/patient-summary-cards";
import { PatientProfileTabs } from "@/features/patients/profile-tabs";

export default async function PatientProfilePage({ params }: { params: { id: string } }) {
  const patient = await getPatientProfile(params.id);
  if (!patient) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <PatientHero patient={patient} />
      <PatientSummaryCards patient={patient} />
      <PatientProfileTabs patient={patient} />
    </div>
  );
}
