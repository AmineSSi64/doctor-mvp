import { requireDoctor } from "@/lib/session";
import { db } from "@/lib/db";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { notFound } from "next/navigation";

export default async function SettingsPage() {
  const user = await requireDoctor();
  const doctor = await db.doctor.findUnique({
    where: { id: user.doctorId },
    include: { clinic: true },
  });
  if (!doctor) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <PageHeader title="Settings" description="Your account and clinic information." />

      <Card>
        <CardHeader>
          <CardTitle>Doctor profile</CardTitle>
        </CardHeader>
        <CardBody>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Field label="Name" value={`Dr. ${doctor.firstName} ${doctor.lastName}`} />
            <Field label="Specialty" value={doctor.specialty} />
            <Field label="Phone" value={doctor.phone} />
            <Field
              label="Experience"
              value={doctor.yearsExperience ? `${doctor.yearsExperience} years` : "—"}
            />
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clinic</CardTitle>
        </CardHeader>
        <CardBody>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Field label="Name" value={doctor.clinic.name} />
            <Field label="City" value={doctor.clinic.city} />
            <Field label="Governorate" value={doctor.clinic.governorate} />
            <Field label="Address" value={doctor.clinic.address ?? "—"} />
          </dl>
        </CardBody>
      </Card>

      <p className="text-xs text-ink-soft">
        Editing this information isn&apos;t part of the MVP yet — see the roadmap in README.md.
      </p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-soft">{label}</dt>
      <dd className="mt-0.5 font-medium text-ink">{value}</dd>
    </div>
  );
}
