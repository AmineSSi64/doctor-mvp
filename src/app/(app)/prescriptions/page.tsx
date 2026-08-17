import Link from "next/link";
import { listPrescriptions } from "@/server/services/prescriptionService";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate, initials } from "@/lib/utils";
import { Plus, Pill } from "lucide-react";

export default async function PrescriptionsPage() {
  const prescriptions = await listPrescriptions();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        title="Prescriptions"
        description={`Most recent ${prescriptions.length} prescriptions`}
      />

      <Card>
        <CardBody className="p-0">
          {prescriptions.length === 0 ? (
            <EmptyState
              icon={Pill}
              title="No prescriptions yet"
              description="Prescriptions are created from a consultation."
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
                    <th className="px-5 py-3 font-medium">Items</th>
                    <th className="px-5 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {prescriptions.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-bg">
                      <td className="px-5 py-3 font-mono text-ink-muted">
                        {formatDate(p.issuedAt)}
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/patients/${p.patientId}`}
                          className="flex items-center gap-2 font-medium text-ink hover:text-primary"
                        >
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-soft text-[10px] font-semibold text-primary">
                            {initials(p.patient.firstName, p.patient.lastName)}
                          </span>
                          {p.patient.firstName} {p.patient.lastName}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-ink-muted">
                        Dr. {p.doctor.firstName} {p.doctor.lastName}
                      </td>
                      <td className="px-5 py-3 text-ink-muted">{p.items.length}</td>
                      <td className="px-5 py-3 text-right">
                        <Link href={`/prescriptions/${p.id}`} className="text-xs font-medium text-primary hover:underline">
                          View
                        </Link>
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
