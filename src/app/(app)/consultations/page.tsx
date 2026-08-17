import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { formatDateTime, CONSULTATION_TYPE_LABEL, initials } from "@/lib/utils";
import { Plus, Stethoscope } from "lucide-react";

export default async function ConsultationsPage() {
  const consultations = await db.consultation.findMany({
    orderBy: { consultedAt: "desc" },
    take: 50,
    include: { patient: true, doctor: true, diagnosis: true },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        title="Consultations"
        description={`Most recent ${consultations.length} consultations`}
      />

      <Card>
        <CardBody className="p-0">
          {consultations.length === 0 ? (
            <EmptyState
              icon={Stethoscope}
              title="No consultations yet"
              description="Consultations are created from a patient's profile."
              action={
                <Link href="/patients">
                  <Button size="sm">
                    <Plus className="h-4 w-4" /> Go to Patients
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-soft">
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Patient</th>
                    <th className="px-5 py-3 font-medium">Doctor</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Diagnosis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {consultations.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-bg">
                      <td className="px-5 py-3 font-mono text-ink-muted">
                        {formatDateTime(c.consultedAt)}
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/patients/${c.patientId}`}
                          className="flex items-center gap-2 font-medium text-ink hover:text-primary"
                        >
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-soft text-[10px] font-semibold text-primary">
                            {initials(c.patient.firstName, c.patient.lastName)}
                          </span>
                          {c.patient.firstName} {c.patient.lastName}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-ink-muted">
                        Dr. {c.doctor.firstName} {c.doctor.lastName}
                      </td>
                      <td className="px-5 py-3 text-ink-muted">
                        {CONSULTATION_TYPE_LABEL[c.type]}
                      </td>
                      <td className="px-5 py-3 text-ink-muted">
                        {c.customDiagnosis || c.diagnosis.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
