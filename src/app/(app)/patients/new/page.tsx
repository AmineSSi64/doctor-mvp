import { PatientForm } from "@/features/patients/patient-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NewPatientPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <PageHeader title="New Patient" description="Add a new patient to your practice." />
      <PatientForm />
    </div>
  );
}
