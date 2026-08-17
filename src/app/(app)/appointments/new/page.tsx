import { listPatientOptions } from "@/server/services/patientService";
import { listDoctors, listClinics } from "@/server/services/referenceService";
import { AppointmentForm } from "@/features/appointments/appointment-form";
import { PageHeader } from "@/components/ui/page-header";

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: { patientId?: string };
}) {
  const [patients, doctors, clinics] = await Promise.all([
    listPatientOptions(),
    listDoctors(),
    listClinics(),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <PageHeader title="New Appointment" description="Schedule a new patient appointment." />
      <AppointmentForm
        patients={patients}
        doctors={doctors}
        clinics={clinics}
        defaultPatientId={searchParams.patientId}
      />
    </div>
  );
}
