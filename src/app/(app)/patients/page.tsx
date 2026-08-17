import Link from "next/link";
import { listPatients } from "@/server/services/patientService";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PatientSearchBar } from "@/features/patients/search-bar";
import { PatientsPagination } from "@/features/patients/pagination";
import { calculateAge, formatDate } from "@/lib/utils";
import { Plus, Users, ChevronRight, MapPin } from "lucide-react";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const { patients, total, page, pageCount } = await listPatients({
    query: searchParams.q,
    page: searchParams.page ? Number(searchParams.page) : 1,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        title="Patients"
        description={`${total.toLocaleString()} total`}
        actions={
          <Link href="/patients/new">
            <Button size="sm">
              <Plus className="h-4 w-4" /> New Patient
            </Button>
          </Link>
        }
      />

      <PatientSearchBar defaultValue={searchParams.q ?? ""} />

      <Card>
        <CardBody className="p-0">
          {patients.length === 0 ? (
            <EmptyState
              icon={Users}
              title={searchParams.q ? "No patients match your search" : "No patients yet"}
              description={
                searchParams.q
                  ? "Try a different name, patient ID, or phone number."
                  : "Add your first patient to get started."
              }
              action={
                !searchParams.q && (
                  <Link href="/patients/new">
                    <Button size="sm">
                      <Plus className="h-4 w-4" /> New Patient
                    </Button>
                  </Link>
                )
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-soft">
                    <th className="px-5 py-3 font-medium">Patient</th>
                    <th className="px-5 py-3 font-medium">Age</th>
                    <th className="px-5 py-3 font-medium">Phone</th>
                    <th className="px-5 py-3 font-medium">City</th>
                    <th className="px-5 py-3 font-medium">Last Consultation</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {patients.map((p, i) => (
                    <tr
                      key={p.id}
                      className="group animate-fade-in-up transition-colors duration-200 hover:bg-primary-soft/30"
                      style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                    >
                      <td className="px-5 py-3">
                        <Link href={`/patients/${p.id}`} className="flex items-center gap-3">
                          <Avatar firstName={p.firstName} lastName={p.lastName} />
                          <div className="min-w-0">
                            <p className="font-medium text-ink transition-colors group-hover:text-primary">
                              {p.firstName} {p.lastName}
                            </p>
                            <p className="font-mono text-xs text-ink-soft">{p.patientCode}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-ink-muted">
                        {calculateAge(p.dateOfBirth)}
                      </td>
                      <td className="px-5 py-3 font-mono text-ink-muted">{p.phone}</td>
                      <td className="px-5 py-3 text-ink-muted">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-ink-soft" />
                          {p.city}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-ink-muted">
                        {p.consultations[0] ? formatDate(p.consultations[0].consultedAt) : "—"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link href={`/patients/${p.id}`}>
                          <ChevronRight className="ml-auto h-4 w-4 text-ink-soft opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
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

      {pageCount > 1 && (
        <PatientsPagination page={page} pageCount={pageCount} query={searchParams.q} />
      )}
    </div>
  );
}
