import { notFound } from "next/navigation";
import { getPrescription } from "@/server/services/prescriptionService";
import { formatDate, calculateAge } from "@/lib/utils";
import { PrintButton } from "@/features/prescriptions/print-button";
import { Logo, APP_NAME } from "@/components/ui/logo";

export default async function PrescriptionDetailPage({ params }: { params: { id: string } }) {
  const prescription = await getPrescription(params.id);
  if (!prescription) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Prescription</h1>
        <PrintButton />
      </div>

      {/* Printable area */}
      <div className="rounded-lg border border-border bg-surface p-8 print:border-none print:p-0">
        <div className="mb-8 flex items-start justify-between border-b border-border pb-6">
          <div className="flex items-start gap-3">
            <Logo size={28} className="mt-0.5 shrink-0 print:hidden" />
            <div>
              <p className="text-lg font-semibold text-ink">
                Dr. {prescription.doctor.firstName} {prescription.doctor.lastName}
              </p>
              <p className="text-sm text-ink-muted">{prescription.doctor.specialty}</p>
              <p className="text-sm text-ink-muted">{prescription.doctor.phone}</p>
              <p className="mt-1 text-xs text-ink-soft print:hidden">{APP_NAME}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-ink-soft">Date issued</p>
            <p className="text-sm font-medium text-ink">{formatDate(prescription.issuedAt)}</p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-soft">Patient</p>
            <p className="font-medium text-ink">
              {prescription.patient.firstName} {prescription.patient.lastName}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-soft">Age</p>
            <p className="font-medium text-ink">{calculateAge(prescription.patient.dateOfBirth)} years</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-wide text-ink-soft">Diagnosis</p>
            <p className="font-medium text-ink">
              {prescription.consultation.customDiagnosis || prescription.consultation.diagnosis.name}
            </p>
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-soft">
              <th className="py-2 font-medium">Medication</th>
              <th className="py-2 font-medium">Dosage</th>
              <th className="py-2 font-medium">Frequency</th>
              <th className="py-2 font-medium">Duration</th>
              <th className="py-2 font-medium">Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {prescription.items.map((item) => (
              <tr key={item.id}>
                <td className="py-2.5 font-medium text-ink">{item.medication.name}</td>
                <td className="py-2.5 text-ink-muted">{item.dosage}</td>
                <td className="py-2.5 text-ink-muted">{item.frequencyPerDay}x/day</td>
                <td className="py-2.5 text-ink-muted">{item.durationDays} days</td>
                <td className="py-2.5 text-ink-muted">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-12 flex justify-end">
          <div className="text-center">
            <div className="mb-1 h-12 w-40 border-b border-ink-soft" />
            <p className="text-xs text-ink-soft">Doctor&apos;s signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}
